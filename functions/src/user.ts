
// Server-side user services (e.g., Firebase Cloud Functions)
// For friend requests, profile updates, etc.


import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

type BasicCallableRequest<TData = Record<string, unknown>> = {
  auth?: {
    uid?: string;
  };
  data: TData;
};




// Send friend request
export const sendFriendRequest = onCall(async (request: BasicCallableRequest<{ receiverId?: string }>) => {
  const senderId = request.auth?.uid;
  if (!senderId) {
    throw new HttpsError("unauthenticated", "User must be authenticated to send a friend request.");
  }

  const {receiverId} = request.data;
  console.log("Receiver ID:", receiverId);

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

    const receiverUpdatedReceivedFriendRequests = [...receivedRequests, senderId];
    if (receiverUpdatedReceivedFriendRequests.length > 100) {
      throw new HttpsError("resource-exhausted", "Receiver has too many pending friend requests.");
    }
    
    const senderUpdatedSentFriendRequests = [...( (await senderRef.get()).data()?.sentFriendRequests || [] ), receiverId];
    if (senderUpdatedSentFriendRequests.length > 100) {
      throw new HttpsError("resource-exhausted", "You have too many pending sent friend requests.");
    }

    // Check if they are already friends
    const senderData = (await senderRef.get()).data();
    const senderFriends = senderData?.friends || [];
    if (senderFriends.includes(receiverId)) {
      throw new HttpsError("already-exists", "You are already friends with this user.");
    }

    batch.update(senderRef, {
      sentFriendRequests: senderUpdatedSentFriendRequests,
    });

    batch.update(receiverRef, {
      receivedFriendRequests: receiverUpdatedReceivedFriendRequests,
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

export const acceptFriendRequest = onCall(async (request: BasicCallableRequest<{ senderId?: string }>) => {
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

    const accepterFriends = [...(accepterData?.friends || []), senderId];
    const accepterUpdatedReceivedFriendRequests = receivedRequests.filter((id: string) => id !== senderId);
    if (accepterFriends.length > 500) {
      throw new HttpsError("resource-exhausted", "You have too many friends.");
    }

    const senderFriends = [...((await senderRef.get()).data()?.friends || []), accepterId];
    const senderUpdatedSentFriendRequests = [...((await senderRef.get()).data()?.sentFriendRequests).filter((id: string) => id !== accepterId)];
    if (senderFriends.length > 500) {
      throw new HttpsError("resource-exhausted", "The other user has too many friends.");
    }


    // Add to both users' friend lists
    batch.update(accepterRef, {
      friends: accepterFriends,
      receivedFriendRequests: accepterUpdatedReceivedFriendRequests,
    });

    batch.update(senderRef, {
      friends: senderFriends,
      sentFriendRequests: senderUpdatedSentFriendRequests,
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

export const rejectFriendRequest = onCall(async (request: BasicCallableRequest<{ senderId?: string }>) => {
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

    const rejecterUpdatedReceivedFriendRequests = (await rejecterRef.get()).data()?.receivedFriendRequests.filter((id: string) => id !== senderId);
    const senderUpdatedSentFriendRequests = (await senderRef.get()).data()?.sentFriendRequests.filter((id: string) => id !== rejecterId);
    
    // Remove from both users' request lists
    batch.update(rejecterRef, {
      receivedFriendRequests: rejecterUpdatedReceivedFriendRequests,
    });

    batch.update(senderRef, {
      sentFriendRequests: senderUpdatedSentFriendRequests,
    });

    await batch.commit();

    return { success: true, message: "Friend request rejected" };
  } catch (error) {
    console.error("Reject friend request error:", error);
    throw new HttpsError("internal", "Failed to reject friend request");
  }
});

export const cancelSentFriendRequest = onCall(async (request: BasicCallableRequest<{ receiverId?: string }>) => {
  const senderId = request.auth?.uid;
  if (!senderId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { receiverId } = request.data;
  if (!receiverId) {
    throw new HttpsError("invalid-argument", "Receiver ID is required");
  }

  try {
    const db = admin.firestore();
    const senderRef = db.collection("users").doc(senderId);
    const receiverRef = db.collection("users").doc(receiverId);

    const [senderDoc, receiverDoc] = await Promise.all([senderRef.get(), receiverRef.get()]);

    if (!senderDoc.exists) {
      throw new HttpsError("not-found", "Sender user not found");
    }

    if (!receiverDoc.exists) {
      throw new HttpsError("not-found", "Receiver user not found");
    }

    const senderData = senderDoc.data();
    const receiverData = receiverDoc.data();

    const sentRequests: string[] = senderData?.sentFriendRequests || [];
    if (!sentRequests.includes(receiverId)) {
      throw new HttpsError("not-found", "Friend request not found");
    }

    const receiverRequests: string[] = receiverData?.receivedFriendRequests || [];
    if (!receiverRequests.includes(senderId)) {
      throw new HttpsError("not-found", "Friend request not found");
    }

    const batch = db.batch();
    batch.update(senderRef, {
      sentFriendRequests: admin.firestore.FieldValue.arrayRemove(receiverId),
    });
    batch.update(receiverRef, {
      receivedFriendRequests: admin.firestore.FieldValue.arrayRemove(senderId),
    });

    await batch.commit();

    return { success: true, message: "Friend request cancelled" };
  } catch (error) {
    console.error("Cancel sent friend request error:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to cancel friend request");
  }
});

export const removeFriend = onCall(async (request: BasicCallableRequest<{ friendId?: string }>) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { friendId } = request.data;
  if (!friendId) {
    throw new HttpsError("invalid-argument", "Friend ID is required");
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const friendRef = db.collection("users").doc(friendId);

    const [userDoc, friendDoc] = await Promise.all([userRef.get(), friendRef.get()]);

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    if (!friendDoc.exists) {
      throw new HttpsError("not-found", "Friend user not found");
    }

    const userData = userDoc.data();
    const friendData = friendDoc.data();

    const userFriends: string[] = userData?.friends || [];
    if (!userFriends.includes(friendId)) {
      throw new HttpsError("not-found", "Friend not found in your list");
    }

    const friendFriends: string[] = friendData?.friends || [];
    if (!friendFriends.includes(userId)) {
      throw new HttpsError("not-found", "Friend relationship not found on the other user");
    }

    const batch = db.batch();
    batch.update(userRef, {
      friends: admin.firestore.FieldValue.arrayRemove(friendId),
    });
    batch.update(friendRef, {
      friends: admin.firestore.FieldValue.arrayRemove(userId),
    });

    await batch.commit();

    return { success: true, message: "Friend removed" };
  } catch (error) {
    console.error("Remove friend error:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to remove friend");
  }
});

export const getFriendsList = onCall(async (request: BasicCallableRequest) => {
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
    const friends: string[] = userData?.friends || [];

    if (friends.length === 0) {
      return { friends: [] };
    }

    const friendProfiles = await Promise.all(
      friends.map(async (friendId: string) => {
        const friendDoc = await db.collection("users").doc(friendId).get();
        if (!friendDoc.exists) {
          return null;
        }

        const friendData = friendDoc.data();
        return {
          userId: friendId,
          displayName: friendData?.displayName,
          photoURL: friendData?.photoURL,
        };
      }),
    );

    return { friends: friendProfiles.filter(Boolean) };
  } catch (error) {
    console.error("Get friends list error:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to get friends list");
  }
});

export const getFriendSuggestions = onCall(async (request: BasicCallableRequest) => {
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

export const getPendingFriendRequests = onCall(async (request: BasicCallableRequest) => {
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
    const searchTerm = displayName.toLowerCase().trim();
    
    // Calculate the end range for prefix search (similar to Swift's queryStarting)
    // For "john", this searches "john" to "john\uf8ff" (matches "john", "johnny", "johnson", etc.)
    const endTerm = searchTerm + '\uf8ff';
    
    // Query Firestore with efficient range query
    const usersSnapshot = await db.collection("users")
      .where("displayNameLower", ">=", searchTerm)
      .where("displayNameLower", "<=", endTerm)
      .limit(20)
      .get();

    const users = usersSnapshot.docs
      .filter(doc => doc.id !== userId) // Exclude current user
      .map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || "",
          displayName: data.displayName || "",
          photoURL: data.photoURL || null,
        };
      })
      .slice(0, 10); // Return top 10 matches

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
    throw new HttpsError("invalid-argument", "Email is required");
  }

  try {
    const db = admin.firestore();
    const searchEmail = email.toLowerCase().trim();
    
    // Query Firestore by email
    const usersSnapshot = await db.collection("users")
      .where("emailLower", "==", searchEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return { users: [] };
    }
    
    const users = usersSnapshot.docs
      .filter(doc => doc.id !== userId) // Exclude current user
      .map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || "",
          displayName: data.displayName || "",
          photoURL: data.photoURL || null,
        };
      });

    return { users };
  } catch (error: any) {
    console.error("Get user by email error:", error);
    throw new HttpsError("internal", "Failed to get user by email");
  }
});
