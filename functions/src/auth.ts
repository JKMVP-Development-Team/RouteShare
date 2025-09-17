import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

// Create a new user (admin operation)
export const createUser = onRequest(async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
    
    res.json({ 
      success: true, 
      uid: userRecord.uid,
      email: userRecord.email 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Delete a user (admin operation)
export const deleteUser = onRequest(async (req, res) => {
  try {
    const { uid } = req.body;
    
    await admin.auth().deleteUser(uid);
    
    // Also delete user's data from Firestore
    await admin.firestore().collection('users').doc(uid).delete();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get user information
export const getUser = onRequest(async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      res.status(400).json({ error: "uid is required" });
      return;
    }
    
    const userRecord = await admin.auth().getUser(uid as string);
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update user profile
export const updateUserProfile = onRequest(async (req, res) => {
  try {
    const { uid, displayName, email } = req.body;
    
    await admin.auth().updateUser(uid, {
      displayName,
      email
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});