import { UserProfile } from '@/constants/user';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Real-time listener for friend requests
export const onFriendRequestsChange = (callback: (requests: any[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};
    
    const userRef = doc(db, 'users', user.uid);
    
    return onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const receivedRequests = data.receivedFriendRequests || [];
            
            // Get profiles for the requests
            const requestProfiles = await Promise.all(
                receivedRequests.map(async (senderId: string) => {
                    const profile = await getUserProfile(senderId);
                    return profile;
                })
            );
            
            callback(requestProfiles.filter(Boolean));
        }
    });
};

// Get a user's profile
export const getUserProfile = async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            joinedAt: data?.joinedAt?.toDate ? data.joinedAt.toDate() : data?.joinedAt
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

