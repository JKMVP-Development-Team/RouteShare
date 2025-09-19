import { UserProfile } from '@/constants/user';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from './firebase';

const functions = getFunctions();

const sendFriendRequestCallable = httpsCallable(functions, 'sendFriendRequest');
const acceptFriendRequestCallable = httpsCallable(functions, 'acceptFriendRequest');
const declineFriendRequestCallable = httpsCallable(functions, 'declineFriendRequest');
const getFriendSuggestionsCallable = httpsCallable(functions, 'getFriendSuggestions');
const getPendingFriendRequestsCallable = httpsCallable(functions, 'getPendingFriendRequests');

export const sendFriendRequest = async (receiverId: string) => {
    const result = await sendFriendRequestCallable({ receiverId });
    return result.data;
};

export const acceptFriendRequest = async (senderId: string) => {
    const result = await acceptFriendRequestCallable({ senderId });
    return result.data;
};

export const declineFriendRequest = async (senderId: string) => {
    const result = await declineFriendRequestCallable({ senderId});
    return result.data;
};

export const getFriendSuggestions = async () => {
    const result = await getFriendSuggestionsCallable({});
    return result.data as UserProfile[];
};

export const getPendingFriendRequests = async () => {
    const result = await getPendingFriendRequestsCallable({});
    return result.data as UserProfile[];
};


// Real-time listener for friend requests
export const onFriendRequestsChange = (callback: (requests: any[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};
    
    const userRef = doc(db, 'users', user.uid);
    
    return onSnapshot(userRef, async (doc: any) => {
        if (doc.exists()) {
            const data = doc.data();
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

