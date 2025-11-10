
import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";



export const createRoute = onCall(async (request) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError("unauthenticated", "User must be authenticated to create a route.");
    }

    try {
    const routeData = {
      ...request.data,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection("routes").add(routeData);
    return {success: true, id: docRef.id};
  } catch (error) {
    console.error("Error creating route:", error);
    throw new HttpsError("internal", "Failed to create route.");
  }

});

export const onRouteCreated = onDocumentCreated("routes/{routeId}", (event) => {
    console.log("New route created:", event.data?.id);
    // Update User States
    // Send Notification to Party members
    // Process route data i.e. use Google maps routing API etc.
});

export const getUserRoutes = onCall(async (res) => {
  const userId = res.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated to get routes.");
  }

  try {

    const snapshot = await admin.firestore()
      .collection("routes")
      .where("userId", "==", userId)
      .get();

    const routes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {routes};
  } catch (error) {
    console.error("Error fetching user routes:", error);
    throw new HttpsError("internal", "Failed to fetch user routes.");
  }
});


export const deleteRoute = onCall(async (res) => {
  const userId = res.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "User must be authenticated to delete a route.");
  }

  const {routeId} = res.data;
  if (!routeId) {
    throw new HttpsError("invalid-argument", "Route ID is required.");
  }

  try {

    const routeRef = admin.firestore().collection("routes").doc(routeId);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return {error: "Route not found"};
    }

    const routeData = routeDoc.data();
    if (routeData?.userId !== userId) {
      return {error: "Permission denied"};
    }

    await routeRef.delete();
    return {success: true};
  } catch (error) {
    console.error("Error deleting route:", error);
    throw new HttpsError("internal", "Failed to delete route.");
  }
});
