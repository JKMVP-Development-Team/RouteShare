
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";


export const getUserRoutes = onRequest(async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    
    const snapshot = await admin.firestore()
      .collection('routes')
      .where('userId', '==', userId)
      .get();
    
    const routes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ routes });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export const deleteRoute = onRequest(async (req, res) => {
  try {
    const { routeId } = req.body;
    await admin.firestore().collection('routes').doc(routeId).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});