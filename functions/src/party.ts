// Server-side Code to Manage Parties


import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { onCall } from "firebase-functions/https";
import { Timestamp } from "firebase/firestore";
import * as QRCode from "qrcode";
import { PartyDocument } from "../../constants/party";

const db = admin.firestore();

// Create a new party
export const createParty = functions.https.onCall(async (data: any, context: any) => {
    const userId = context.auth?.uid;
    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to create a party.");
    }
    
    const partyData: PartyDocument = {
        id : "", // Firestore will auto-generate
        name: data.name,
        routeId: data.routeId,
        hostId: userId,
        createdAt: Timestamp.now(),

        maxMembers: data.maxMembers || 10,
        isPrivate: data.isPrivate || false,
        inviteCode: data.isPrivate ? generateInvites() : undefined,

        members: [{
            userId: userId,
            joinedAt: Timestamp.now(),
            role: 'host',
            status: 'active'
        }],

        currentState: {
            status: 'waiting',
            currentWaypointIndex: 0
        },

        pendingChanges: [],

        stats: {
            totalDistance: 0,
            totalTime: 0,
            averageSpeed: 0,
            stopsCompleted: 0
        }
    };

    const partyRef = await db.collection("parties").add(partyData);
    return { partyId: partyRef.id };
});

export const getPartyDetails = onCall(async (data: any, context: any) => {
    const userId = context.auth?.uid;   
    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to get party details.");    
    }
    
    const partyId = data.partyId;
    if (!partyId) {
        throw new functions.https.HttpsError("invalid-argument", "Party ID is required.");
    }
    
    const partyDoc = await db.collection("parties").doc(partyId).get();
    if (!partyDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Party not found.");
    }

    const partyData = partyDoc.data() as PartyDocument;
    const isMember = partyData.members.some(member => member.userId === userId);
    if (!isMember) {
        throw new functions.https.HttpsError("permission-denied", "User is not a member of this party.");
    }
    
    return { party: partyData };
});


export const getMembers = onCall(async (data: any, context: any) => {
    const userId = context.auth?.uid;
    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to get party members.");
    }
    
    const partyId = data.partyId;
    if (!partyId) {
        throw new functions.https.HttpsError("invalid-argument", "Party ID is required.");
    }

    const partyDoc = await db.collection("parties").doc(partyId).get();
    if (!partyDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Party not found.");
    }
    
    const partyData = partyDoc.data() as PartyDocument;
    const isMember = partyData.members.some(member => member.userId === userId);
    if (!isMember) {
        throw new functions.https.HttpsError("permission-denied", "User is not a member of this party.");
    }
    
    return { members: partyData.members };
});

export const joinParty = onCall(async (data: any, context: any) => {

});


// Helper function to generate a random invite code
async function generateInvites(length: number = 6): Promise<{inviteCode: string, qrCode: string}> {
    let inviteCode: string;

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
    inviteCode = (timestamp + random).substring(0, length);


    try {
        const qrCodeDataURL = await QRCode.toDataURL(inviteCode!, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            width: 256,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
        });
        return { inviteCode: inviteCode!, qrCode: qrCodeDataURL };
    } catch (err) {
        console.error("Error generating QR code:", err);
        throw new functions.https.HttpsError("internal", "Failed to generate QR code.");
    }
}