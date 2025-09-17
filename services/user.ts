import { UserProfile } from '@/constants/user';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const createUserProfile = async (userData: UserProfile) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: userData.displayName || user.displayName || 'Anonymous User',
        photoURL: userData.photoURL || user.photoURL || null,
        joinedAt: new Date(),
        stats: {
            routesCreated: 0,
            partiesJoined: 0,
            totalDistance: 0,
        },
        preferences: {
            units: userData.preferences?.units || 'metric',
            privacy: userData.preferences?.privacy || 'public',
        },
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
};

// Get a user's profile
export const getUserProfile = async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            joinedAt: data.joinedAt.toDate ? data.joinedAt.toDate() : data.joinedAt
        };
    }
    return null;
};

// Update user profile
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updates);
};