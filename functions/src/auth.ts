import * as admin from "firebase-admin";
import {onRequest} from "firebase-functions/v2/https";

// Create a new user (admin operation)
export const createUser = onRequest(async (req, res) => {
  try {
    const {email, password, displayName} = req.body;

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

    res.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Delete a user (admin operation)
export const deleteUser = onRequest(async (req, res) => {
  try {
    const {uid} = req.body;

    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();

    res.json({success: true});
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
