
import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onRequest} from "firebase-functions/v2/https";

const verifyUser = async (req: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No authorization token provided");
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
};

export const createRoute = onRequest(async (req, res) => {
  try {
    const userId = await verifyUser(req);

    const routeData = {
      ...req.body,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection("routes").add(routeData);
    res.json({success: true, id: docRef.id});
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
});

export const onRouteCreated = onDocumentCreated("routes/{routeId}", (event) => {
    console.log("New route created:", event.data?.id);
    // Update User States
    // Send Notification to Party members
    // Process route data i.e. use Google maps routing API etc.
});

export const getUserRoutes = onRequest(async (req, res) => {
  try {
    const userId = await verifyUser(req);

    const snapshot = await admin.firestore()
      .collection("routes")
      .where("userId", "==", userId)
      .get();

    const routes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({routes});
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get routes",
    });
  }
});


export const deleteRoute = onRequest(async (req, res) => {
  try {
    const userId = await verifyUser(req);
    const {routeId} = req.body;

    const routeRef = admin.firestore().collection("routes").doc(routeId);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      res.status(404).json({error: "Route not found"});
      return;
    }

    const routeData = routeDoc.data();
    if (routeData?.userId !== userId) {
      res.status(403).json({error: "Not authorized to delete this route"});
      return;
    }

    await routeRef.delete();
    res.json({success: true});
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete route",
    });
  }
});
