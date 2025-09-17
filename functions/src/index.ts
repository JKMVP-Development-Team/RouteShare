/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/firestore";
import { onRequest } from "firebase-functions/v2/https";

import { createUser, deleteUser, getUser, updateUserProfile } from "./auth";
import { deleteRoute, getUserRoutes } from "./routes";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();


export const createRoute = onRequest(async (req, res) => {
    try {
        const routeData = req.body;
        const docRef = await admin.firestore().collection('routes').add(routeData);
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

export const onRouteCreated = onDocumentCreated("routes/{routeId}", (event) => {
    console.log("New route created:", event.data?.id);
});

export { createUser, deleteRoute, deleteUser, getUser, getUserRoutes, updateUserProfile };
