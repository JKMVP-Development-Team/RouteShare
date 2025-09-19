import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

// Create a new user (admin operation)
export const createUser = onCall(async (res) => {
  try {
    const {email, password, displayName} = res.data;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {routesCreated: 0, partiesJoined: 0, totalDistance: 0},
      preferences: {units: "metric", privacy: "public"},
    });


    return { uid: userRecord.uid, email: userRecord.email };
  } catch (error) {
    throw new HttpsError("internal", error instanceof Error ? error.message : "Unknown error");
  }
});

// Delete a user (admin operation)
export const deleteUser = onCall(async (res) => {
  try {
    const {uid} = res.data;

    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();

    return { success: true };
  } catch (error) {
    throw new HttpsError("internal", error instanceof Error ? error.message : "Unknown error");
  }
});
