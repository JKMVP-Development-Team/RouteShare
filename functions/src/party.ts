import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https"; // Fix: Use v2 consistently
import { Timestamp } from "firebase/firestore";
import * as QRCode from "qrcode";
import { PartyDocument } from "../../constants/party";

const db = admin.firestore();

// TODO: Add invite expiration handling
// TODO: Add party deletion handling

// Create a new party
export const createParty = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to create a party."
    );
  }

  let inviteData;
  if (request.data.isPrivate) {
    inviteData = await generateInvites();
    const inviteRef = {
      inviteCode: inviteData.inviteCode,
      qrCode: inviteData.qrCode,
      expirationDate: Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ), // 24 hours from now
    };

    // Store invite data in a separate collection
    await db.collection("inviteCode").add({
      ...inviteRef,
      createdAt: Timestamp.now(),
      createdBy: userId,
    });
  }

  const partyData: PartyDocument = {
    id: "", // Firestore will auto-generate
    name: request.data.name,
    routeId: request.data.routeId,
    hostId: userId,
    createdAt: Timestamp.now(),

    maxMembers: request.data.maxMembers || 10,
    isPrivate: request.data.isPrivate || false,
    inviteCode: inviteData?.inviteCode,
    qrCode: inviteData?.qrCode,

    members: [
      {
        userId: userId,
        joinedAt: Timestamp.now(),
        role: "host",
        status: "active",
      },
    ],
    currentState: {
      status: "waiting",
      currentWaypointIndex: 0,
    },
    pendingChanges: [],
    stats: {
      totalDistance: 0,
      totalTime: 0,
      averageSpeed: 0,
      stopsCompleted: 0,
    },
  };

  const partyRef = await db.collection("parties").add(partyData);
  await partyRef.update({ id: partyRef.id });

  return {
    partyId: partyRef.id,
    inviteCode: inviteData?.inviteCode,
    qrCode: inviteData?.qrCode,
  };
});

export const getPartyDetails = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to get party details."
    );
  }

  const partyId = request.data.partyId;
  if (!partyId) {
    throw new HttpsError("invalid-argument", "Party ID is required.");
  }

  const partyDoc = await db.collection("parties").doc(partyId).get();
  if (!partyDoc.exists) {
    throw new HttpsError("not-found", "Party not found.");
  }

  const partyData = partyDoc.data() as PartyDocument;
  const isMember = partyData.members.some((member) => member.userId === userId);
  if (!isMember) {
    throw new HttpsError(
      "permission-denied",
      "User is not a member of this party."
    );
  }

  return { party: partyData };
});

export const getMembers = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to get party members."
    );
  }

  const partyId = request.data.partyId;
  if (!partyId) {
    throw new HttpsError("invalid-argument", "Party ID is required.");
  }

  const partyDoc = await db.collection("parties").doc(partyId).get();
  if (!partyDoc.exists) {
    throw new HttpsError("not-found", "Party not found.");
  }

  const partyData = partyDoc.data() as PartyDocument;
  const isMember = partyData.members.some((member) => member.userId === userId);
  if (!isMember) {
    throw new HttpsError(
      "permission-denied",
      "User is not a member of this party."
    );
  }

  return { members: partyData.members };
});

export const joinParty = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to join a party."
    );
  }

  const { partyId, inviteCode } = request.data;

  if (!partyId) {
    throw new HttpsError("invalid-argument", "Party ID is required.");
  }

  const partyRef = db.collection("parties").doc(partyId);
  const partyDoc = await partyRef.get();
  if (!partyDoc.exists) {
    throw new HttpsError("not-found", "Party not found.");
  }

  // Check if party is still open for joining
  const partyState = (partyDoc.data() as PartyDocument).currentState;
  if (partyState.status === "disbanded" || partyState.status === "ended") {
    throw new HttpsError("failed-precondition", "Party is no longer active.");
  }

  const partyData = partyDoc.data() as PartyDocument;
  const isAlreadyMember = partyData.members.some(
    (member) => member.userId === userId
  );
  if (isAlreadyMember) {
    throw new HttpsError(
      "failed-precondition",
      "User is already a member of this party."
    );
  }

  if (partyData.isPrivate) {
    if (!inviteCode || inviteCode !== partyData.inviteCode) {
      throw new HttpsError(
        "permission-denied",
        "Invalid invite code for private party."
      );
    }
  }

  if (partyData.members.length >= partyData.maxMembers) {
    throw new HttpsError("resource-exhausted", "Party is full.");
  }

  const newMember = {
    userId: userId,
    joinedAt: Timestamp.now(),
    role: "member",
    status: "active",
  };

  await partyRef.update({
    members: admin.firestore.FieldValue.arrayUnion(newMember),
  });

  return { success: true };
});

export const leaveParty = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to leave a party."
    );
  }

  const partyId = request.data.partyId;
  if (!partyId) {
    throw new HttpsError("invalid-argument", "Party ID is required.");
  }

  const partyRef = db.collection("parties").doc(partyId);
  const partyDoc = await partyRef.get();
  if (!partyDoc.exists) {
    throw new HttpsError("not-found", "Party not found.");
  }

  const partyData = partyDoc.data() as PartyDocument;
  const member = partyData.members.find((m) => m.userId === userId);
  if (!member) {
    throw new HttpsError(
      "failed-precondition",
      "User is not a member of this party."
    );
  }

  if (member.role === "host") {
    throw new HttpsError(
      "failed-precondition",
      "Host cannot leave the party. Transfer host role or disband the party."
    );
  }
  await partyRef.update({
    members: admin.firestore.FieldValue.arrayRemove(member),
  });
});

export const disbandParty = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to disband a party."
    );
  }

  const partyId = request.data.partyId;
  if (!partyId) {
    throw new HttpsError("invalid-argument", "Party ID is required.");
  }

  const partyRef = db.collection("parties").doc(partyId);
  const partyDoc = await partyRef.get();
  if (!partyDoc.exists) {
    throw new HttpsError("not-found", "Party not found.");
  }

  const partyData = partyDoc.data() as PartyDocument;
  const member = partyData.members.find((m) => m.userId === userId);
  if (!member || member.role !== "host") {
    throw new HttpsError(
      "permission-denied",
      "Only the host can disband the party."
    );
  }

  await partyRef.update({
    members: [],
    currentState: {
      status: "disbanded",
      currentWaypointIndex: 0,
      completedAt: Timestamp.now(),
    },
    pendingChanges: [],
    stats: {
      totalDistance: 0,
      totalTime: 0,
      averageSpeed: 0,
      stopsCompleted: 0,
    },
  });

  return { success: true };
});

// Helper function to generate a random invite code
async function generateInvites(
  length: number = 6
): Promise<{ inviteCode: string; qrCode: string }> {
  const generateSecureCode = (len: number): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const randomBytes = require("crypto").randomBytes(len);

    for (let i = 0; i < len; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    return result;
  };

  const timestamp = Timestamp.now().seconds.toString(36).toUpperCase();
  const random = generateSecureCode(3);
  const inviteCode = (timestamp + random).substring(0, length);

  try {
    const qrCodeDataURL = await QRCode.toDataURL(inviteCode, {
      errorCorrectionLevel: "M",
      type: "image/png",
      margin: 1,
      width: 256,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return { inviteCode, qrCode: qrCodeDataURL };
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new HttpsError("internal", "Failed to generate QR code");
  }
}
