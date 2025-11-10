
import * as admin from 'firebase-admin';
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { DriverUserProfile, RiderUserProfile } from "../../constants/user";


type BasicCallableRequest<TData = Record<string, unknown>> = {
    auth?: {
        uid: string;
    };
    data: TData;
};

export const registerDriver = onCall(async (request: BasicCallableRequest<{ driverData?: DriverUserProfile, forceUpdate?: boolean}>) => {
    const userId = request.auth?.uid

    if (!userId) {
        throw new Error('Unauthorized: No user ID found in request context');
    }

    const { driverData, forceUpdate = false } = request.data;

    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new HttpsError('not-found', 'User document does not exist');
        }

        const userData = userDoc.data();
        const currentRole = userData?.role;

        if (currentRole === 'driver' && !forceUpdate) {
            throw new HttpsError('failed-precondition', 'User is already registered as a driver');
        }

        const updatedData: Partial<DriverUserProfile> = {
            ...userData,
            ...driverData,
        };

        await userRef.set(updatedData, { merge: true });
        return { message: 'Driver registration successful' };

    } catch (error) {
        console.error('Error registering driver:', error);
        throw new HttpsError('internal', 'Failed to register driver');
    }
});

export const registerRider = onCall(async (request: BasicCallableRequest<{ riderData?: Partial<RiderUserProfile>}>) => {
    const userId = request.auth?.uid
    if (!userId) {
        throw new Error('Unauthorized: No user ID found in request context');
    }

    const { riderData } = request.data;

    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new HttpsError('not-found', 'User document does not exist');
        }

        const userData = userDoc.data();
        const currentRole = userData?.role;
        if (currentRole === 'rider') {
            throw new HttpsError('failed-precondition', 'User is already registered as a rider');
        }

        const updatedData: Partial<RiderUserProfile> = {
            ...userData,
            ...riderData,
        };

        await userRef.set(updatedData, { merge: true });
        return { message: 'Rider registration successful' };
    } catch (error) {
        console.error('Error registering rider:', error);
        throw new HttpsError('internal', 'Failed to register rider');
    }
});