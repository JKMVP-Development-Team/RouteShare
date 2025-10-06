
// Server-side user services (e.g., Firebase Cloud Functions)
// For friend requests, profile updates, etc.


import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";




// Send friend request
export const sendFriendRequest = onCall(async (request) => {
  const senderId = request.auth?.uid;
  if (!senderId) {
    throw new HttpsError("unauthenticated", "User must be authenticated to send a friend request.");
  }

  const {receiverId} = request.data;

  if (!receiverId) {
    throw new HttpsError("invalid-argument", "Receiver ID is required.");
  }

  if (senderId === receiverId) {
    throw new HttpsError("invalid-argument", "Cannot send friend request to yourself.");
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    const senderRef = db.collection("users").doc(senderId);
    const receiverRef = db.collection("users").doc(receiverId);

    const receiverDoc = await receiverRef.get();
    if (!receiverDoc.exists) {
      throw new HttpsError("not-found", "Receiver user not found.");
    }

    const receiverData = receiverDoc.data();
    const receivedRequests = receiverData?.receivedFriendRequests || [];
    if (receivedRequests.includes(senderId)) {
      throw new HttpsError("already-exists", "Friend request already sent");
    }

    batch.update(senderRef, {
      sentFriendRequests: admin.firestore.FieldValue.arrayUnion(receiverId),
    });
    batch.update(receiverRef, {
      receivedFriendRequests: admin.firestore.FieldValue.arrayUnion(senderId),
    });

    await batch.commit();

    // did not test this yet.
    const receiverFCMToken = receiverData?.fcmToken;

    if (receiverFCMToken) {
      await admin.messaging().send({
          token: receiverFCMToken,
          notification: {title: "New friend request!"},
      });
    }

    return {success: true, message: "Friend request sent"};
  } catch (error) {
    console.error("Send friend request error:", error);
    throw new HttpsError("internal", error instanceof Error ? error.message : "Failed to send friend request");
  }
});

export const acceptFriendRequest = onCall(async (request) => {
  const accepterId = request.auth?.uid;
  if (!accepterId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { senderId } = request.data;
  if (!senderId) {
    throw new HttpsError("invalid-argument", "Sender ID is required");
  }

  try {
    const db = admin.firestore();

    // Verify the request exists
    const accepterDoc = await db.collection("users").doc(accepterId).get();
    if (!accepterDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const accepterData = accepterDoc.data();
    const receivedRequests = accepterData?.receivedFriendRequests || [];

    if (!receivedRequests.includes(senderId)) {
      throw new HttpsError("not-found", "Friend request not found");
    }

    // Use batch for atomic operation
    const batch = db.batch();
    const accepterRef = db.collection("users").doc(accepterId);
    const senderRef = db.collection("users").doc(senderId);

    // Add to both users' friend lists
    batch.update(accepterRef, {
      friends: admin.firestore.FieldValue.arrayUnion(senderId),
      receivedFriendRequests: admin.firestore.FieldValue.arrayRemove(senderId),
    });

    batch.update(senderRef, {
      friends: admin.firestore.FieldValue.arrayUnion(accepterId),
      sentFriendRequests: admin.firestore.FieldValue.arrayRemove(accepterId),
    });

    await batch.commit();

    return { success: true, message: "Friend request accepted" };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Accept friend request error:", error);
    throw new HttpsError("internal", "Failed to accept friend request");
  }
});

export const rejectFriendRequest = onCall(async (request) => {
  const rejecterId = request.auth?.uid;
  if (!rejecterId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { senderId } = request.data;
  if (!senderId) {
    throw new HttpsError("invalid-argument", "Sender ID is required");
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    const rejecterRef = db.collection("users").doc(rejecterId);
    const senderRef = db.collection("users").doc(senderId);

    // Remove from both users' request lists
    batch.update(rejecterRef, {
      receivedFriendRequests: admin.firestore.FieldValue.arrayRemove(senderId),
    });

    batch.update(senderRef, {
      sentFriendRequests: admin.firestore.FieldValue.arrayRemove(rejecterId),
    });

    await batch.commit();

    return { success: true, message: "Friend request rejected" };
  } catch (error) {
    console.error("Reject friend request error:", error);
    throw new HttpsError("internal", "Failed to reject friend request");
  }
});

export const getFriendSuggestions = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();
    const currentFriends = userData?.friends || [];
    const sentRequests = userData?.sentFriendRequests || [];
    const receivedRequests = userData?.receivedFriendRequests || [];

    // Get all users except self, current friends, and pending requests
    const excludeIds = [userId, ...currentFriends, ...sentRequests, ...receivedRequests];

    const allUsersSnapshot = await db.collection("users")
      .where("preferences.privacy", "==", "public")
      .limit(50)
      .get();

    const suggestions = [];

    for (const doc of allUsersSnapshot.docs) {
      if (excludeIds.includes(doc.id)) continue;

      const otherUserData = doc.data();
      const mutualFriends = (otherUserData.friends || [])
        .filter((friendId: string) => currentFriends.includes(friendId));

      // Calculate suggestion score
      let score = 0;
      score += mutualFriends.length * 10; // Weight mutual friends highly

      // Location proximity (if both have location)
      if (userData?.location && otherUserData.location) {
        if (userData.location === otherUserData.location) {
          score += 5;
        }
      }

      // Same preferences
      if (userData?.preferences?.units === otherUserData.preferences?.units) {
        score += 1;
      }

      suggestions.push({
        userId: doc.id,
        displayName: otherUserData.displayName,
        photoURL: otherUserData.photoURL,
        mutualFriends: mutualFriends.length,
        score: score,
        location: otherUserData.location,
      });
    }

    // Sort by score and return top 10
    const topSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return { suggestions: topSuggestions };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Get friend suggestions error:", error);
    throw new HttpsError("internal", "Failed to get friend suggestions");
  }
});

export const getPendingFriendRequests = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();
    const receivedRequests = userData?.receivedFriendRequests || [];

    // Get sender profiles
    const senderProfiles = await Promise.all(
      receivedRequests.map(async (senderId: string) => {
        const senderDoc = await db.collection("users").doc(senderId).get();
        if (senderDoc.exists) {
          const senderData = senderDoc.data();
          return {
            userId: senderId,
            displayName: senderData?.displayName,
            photoURL: senderData?.photoURL,
          };
        }
        return null;
      }),
    );

    return { requests: senderProfiles.filter(Boolean) };
  } catch (error) {
    console.error("Get pending requests error:", error);
    throw new HttpsError("internal", "Failed to get pending requests");
  }
});


export const getUserByName = onCall(async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { displayName } = request.data;
  if (!displayName) {
    throw new HttpsError("invalid-argument", "Display name is required");
  }

  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users")
      .where("displayName", "==", displayName)
      .limit(10)
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data(),
    }));

    return { users };
  } catch (error) {
    console.error("Get user by name error:", error);
    throw new HttpsError("internal", "Failed to get users by name");
  }
});


export const getUserByEmail = onCall(async (request) => {
    const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { email } = request.data;
  if (!email) {
    throw new HttpsError("invalid-argument", "Display name is required");
  }


  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data(),
    }));

    return { users };
  }
  catch (error) {
    console.error("Get user by email error:", error);
    throw new HttpsError("internal", "Failed to get users by email");
  }
});
