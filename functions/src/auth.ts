import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { beforeUserCreated, beforeUserSignedIn } from "firebase-functions/v2/identity";

// Blocking function: Sync user to Firestore when they sign up
export const syncUserOnCreate: ReturnType<typeof beforeUserCreated> = beforeUserCreated(async (event) => {
  const user = event.data;
  
  if (!user) {
    return;
  }
  
  // Create Firestore document for searchability
  await admin.firestore().collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    displayNameLower: (user.displayName || "").toLowerCase(), // For case-insensitive search
    emailLower: (user.email || "").toLowerCase(), // For case-insensitive search
    photoURL: user.photoURL || null,
    createdAt: Date.now(),
    friends: [],
    sentFriendRequests: [],
    receivedFriendRequests: [],
    stats: { routesCreated: 0, partiesJoined: 0, totalDistance: 0 },
    preferences: { units: "metric", privacy: "public" },
  });
});

// Update Firestore if user profile changes (e.g., displayName updated via updateProfile)
export const syncUserOnSignIn: ReturnType<typeof beforeUserSignedIn> = beforeUserSignedIn(async (event) => {
  const user = event.data;
  
  if (!user) {
    return;
  }
  
  // Update the Firestore document with latest Auth data
  await admin.firestore().collection("users").doc(user.uid).set({
    email: user.email || "",
    displayName: user.displayName || "",
    displayNameLower: (user.displayName || "").toLowerCase(),
    emailLower: (user.email || "").toLowerCase(),
    photoURL: user.photoURL || null,
  }, { merge: true }); // Merge to not overwrite other fields
});

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
