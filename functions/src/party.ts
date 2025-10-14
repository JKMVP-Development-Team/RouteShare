import { randomBytes } from "crypto";
import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as QRCode from "qrcode";
import { PartyDocument } from "../../constants/party";

// TODO: Add invite expiration handling
// TODO: Add party deletion handling

// Create a new party
export const createParty = onCall(async (request) => {
  const db = admin.firestore();
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to create a party.",
    );
  }

  const now = Date.now();
  
  // Always generate invite codes (all parties are private)
  const inviteData = await generateInvites();
  const inviteRef = {
    inviteCode: inviteData.inviteCode,
    qrCode: inviteData.qrCode,
    expirationDate: now + (24 * 60 * 60 * 1000), // 24 hours from now
  };

  // Store invite data in a separate collection
  await db.collection("inviteCode").add({
    ...inviteRef,
    createdAt: now,
    createdBy: userId,
  });

  const partyData: PartyDocument = {
    id: "", // Firestore will auto-generate
    name: request.data.name,
    hostId: userId,
    createdAt: now,

    maxMembers: request.data.maxMembers || 10,
    inviteCode: inviteData.inviteCode,
    qrCode: inviteData.qrCode,

    members: [
      {
        userId: userId,
        joinedAt: now,
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
  const db = admin.firestore();
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to get party details.",
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
      "User is not a member of this party.",
    );
  }

  return { party: partyData };
});

export const getMembers = onCall(async (request) => {
  const db = admin.firestore();
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to get party members.",
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
      "User is not a member of this party.",
    );
  }

  return { members: partyData.members };
});

export const joinParty = onCall(async (request) => {
  const db = admin.firestore();
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to join a party.",
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
    (member) => member.userId === userId,
  );
  if (isAlreadyMember) {
    throw new HttpsError(
      "failed-precondition",
      "User is already a member of this party.",
    );
  }

  // All parties are private - validate invite code
  if (!inviteCode || inviteCode !== partyData.inviteCode) {
    throw new HttpsError(
      "permission-denied",
      "Invalid invite code. Please enter the correct code to join this party.",
    );
  }

  if (partyData.members.length >= partyData.maxMembers) {
    throw new HttpsError("resource-exhausted", "Party is full.");
  }

  const newMember = {
    userId: userId,
    joinedAt: Date.now(),
    role: "member" as const,
    status: "active" as const,
  };

  // Add the new member to the members array
  const updatedMembers = [...partyData.members, newMember];

  await partyRef.update({
    members: updatedMembers,
  });

  return { success: true };
});

export const leaveParty = onCall(async (request) => {
  const db = admin.firestore();
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to leave a party.",
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
      "User is not a member of this party.",
    );
  }

  if (member.role === "host") {
    throw new HttpsError(
      "failed-precondition",
      "Host cannot leave the party. Transfer host role or disband the party.",
    );
  }

  // Remove the member from the members array
  const updatedMembers = partyData.members.filter((m) => m.userId !== userId);

  await partyRef.update({
    members: updatedMembers,
  });

  return { success: true };
});

export const disbandParty = onCall(async (request) => {
  const db = admin.firestore();
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to disband a party.",
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
      "Only the host can disband the party.",
    );
  }

  await partyRef.update({
    members: [],
    currentState: {
      status: "disbanded",
      currentWaypointIndex: 0,
      completedAt: Date.now(),
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
  length: number = 6,
): Promise<{ inviteCode: string; qrCode: string }> {
  const generateSecureCode = (len: number): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    const bytes = randomBytes(len);

    for (let i = 0; i < len; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  };

  const timestamp = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
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
