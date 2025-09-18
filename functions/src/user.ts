
// Server-side user services (e.g., Firebase Cloud Functions)
// For friend requests, profile updates, etc.


import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { arrayUnion } from "firebase/firestore";

const verifyUser = async (req: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
};



// Send friend request
export const sendFriendRequest = onRequest(async (req: any, res: any) => {
  try {
    const senderId = await verifyUser(req);
    const { receiverId } = req.body;
    
    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }
    
    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }
    
    const db = admin.firestore();
    const batch = db.batch();
    
    const senderRef = db.collection('users').doc(senderId);
    const receiverRef = db.collection('users').doc(receiverId);
    
    batch.update(senderRef, { sentRequests: arrayUnion(receiverId) });
    batch.update(receiverRef, { receivedRequests: arrayUnion(senderId) });
    await batch.commit();
    
    // did not test this yet.
    const receiverDoc = await receiverRef.get();
    const receiverData = receiverDoc.data();
    const receiverFCMToken = receiverData?.fcmToken;
    
    if (receiverFCMToken) {
      await admin.messaging().send({
          token: receiverFCMToken,
          notification: { title: "New friend request!" }
      });
    }
    
    res.json({ success: true, message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send friend request' 
    });
  }
});


export const acceptFriendRequest = onRequest(async (req:any, res:any) => {
  try {
    const accepterId = await verifyUser(req);
    const { senderId } = req.body;
    
    if (!senderId) {
      return res.status(400).json({ error: 'Sender ID is required' });
    }
    
    const db = admin.firestore();
    
    // Verify the request exists
    const accepterDoc = await db.collection('users').doc(accepterId).get();
    const accepterData = accepterDoc.data();
    const receivedRequests = accepterData?.receivedFriendRequests || [];
    
    if (!receivedRequests.includes(senderId)) {
      return res.status(400).json({ error: 'Friend request not found' });
    }
    
    // Use batch for atomic operation
    const batch = db.batch();
    
    const accepterRef = db.collection('users').doc(accepterId);
    const senderRef = db.collection('users').doc(senderId);
    
    // Add to both users' friend lists
    batch.update(accepterRef, { 
      friends: admin.firestore.FieldValue.arrayUnion(senderId),
      receivedFriendRequests: admin.firestore.FieldValue.arrayRemove(senderId)
    });
    
    batch.update(senderRef, { 
      friends: admin.firestore.FieldValue.arrayUnion(accepterId),
      sentFriendRequests: admin.firestore.FieldValue.arrayRemove(accepterId)
    });
    
    await batch.commit();
    
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to accept friend request' 
    });
  }
});

// Reject friend request
export const rejectFriendRequest = onRequest(async (req, res) => {
  try {
    const rejecterId = await verifyUser(req);
    const { senderId } = req.body;
    
    const db = admin.firestore();
    const batch = db.batch();
    
    const rejecterRef = db.collection('users').doc(rejecterId);
    const senderRef = db.collection('users').doc(senderId);
    
    // Remove from both users' request lists
    batch.update(rejecterRef, { 
      receivedFriendRequests: admin.firestore.FieldValue.arrayRemove(senderId)
    });
    
    batch.update(senderRef, { 
      sentFriendRequests: admin.firestore.FieldValue.arrayRemove(rejecterId)
    });
    
    await batch.commit();
    
    res.json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to reject friend request' 
    });
  }
});

// Get friend suggestions
export const getFriendSuggestions = onRequest(async (req:any , res:any) => {
  try {
    const userId = await verifyUser(req);
    const db = admin.firestore();
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentFriends = userData.friends || [];
    const sentRequests = userData.sentFriendRequests || [];
    const receivedRequests = userData.receivedFriendRequests || [];
    
    // Get all users except self, current friends, and pending requests
    const excludeIds = [userId, ...currentFriends, ...sentRequests, ...receivedRequests];
    
    const allUsersSnapshot = await db.collection('users')
      .where('preferences.privacy', '==', 'public')
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
      if (userData.location && otherUserData.location) {
        if (userData.location === otherUserData.location) {
          score += 5;
        }
      }
      
      // Same preferences
      if (userData.preferences?.units === otherUserData.preferences?.units) {
        score += 1;
      }
      
      suggestions.push({
        userId: doc.id,
        displayName: otherUserData.displayName,
        photoURL: otherUserData.photoURL,
        mutualFriends: mutualFriends.length,
        score: score,
        location: otherUserData.location
      });
    }
    
    // Sort by score and return top 10
    const topSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    res.json({ suggestions: topSuggestions });
  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get friend suggestions' 
    });
  }
});