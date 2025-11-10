import { UserProfile } from '@/constants/user';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Real-time listener for friend requests
export const onFriendRequestsChange = (callback: (requests: any[]) => void) => {
    let unsubscribeSnapshot: (() => void) | null = null;
    
    // Wait for auth state to be ready
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        console.log('onFriendRequestsChange - Auth state changed:', user?.uid);
        
        // Clean up previous snapshot listener if it exists
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
        
        if (!user) {
            console.warn('No authenticated user for friend requests listener');
            callback([]);
            return;
        }
        
        const userRef = doc(db, 'users', user.uid);
        
        unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
            console.log('Friend requests snapshot received:', docSnap.exists());
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                const receivedRequests = data.receivedFriendRequests || [];
                console.log('Received friend requests:', receivedRequests);
                
                // Get profiles for the requests
                const requestProfiles = await Promise.all(
                    receivedRequests.map(async (senderId: string) => {
                        const profile = await getUserProfile(senderId);
                        console.log('Loaded profile for:', senderId, profile);
                        return profile;
                    })
                );
                
                const validProfiles = requestProfiles.filter(Boolean);
                console.log('Valid profiles to callback:', validProfiles);
                callback(validProfiles);
            } else {
                console.warn('User document does not exist');
                callback([]);
            }
        }, (error) => {
            console.error('Friend requests listener error:', error);
        });
    });
    
    // Return cleanup function that unsubscribes from both listeners
    return () => {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
        unsubscribeAuth();
    };
};

// Get a user's profile
export const getUserProfile = async (userId: string) => {
    console.log('getUserProfile called for:', userId);
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        const profile = {
            uid: userId, // Ensure uid is always included
            ...data,
            joinedAt: data?.joinedAt?.toDate ? data.joinedAt.toDate() : data?.joinedAt
        };
        console.log('getUserProfile returning:', profile);
        return profile;
    }
    console.warn('getUserProfile - User not found:', userId);
    return null;
};

// Update user profile
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updates);
};

