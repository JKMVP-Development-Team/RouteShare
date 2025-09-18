import { UserProfile } from '@/constants/user';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
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
        friends: [],
        sentFriendRequests: [],
        receivedFriendRequests: [],
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

export const sendFriendRequest = async (toUserId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sendFriendRequest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ toUserId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
    }

    return await response.json();
};


export const acceptFriendRequest = async (fromUserId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/acceptFriendRequest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fromUserId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept friend request');
    }

    return await response.json();
};

export const declineFriendRequest = async (fromUserId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const token = await user.getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/declineFriendRequest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fromUserId }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline friend request');
    }
    return await response.json();
};  


export const getFriendSuggestions = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/getFriendSuggestions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get friend suggestions');
    }
    
    return response.json();
};

// Get pending friend requests
export const getPendingFriendRequests = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error('User profile not found');
    
    const userData = userSnap.data();
    const receivedRequests: string[] = userData.receivedFriendRequests || [];
    
    // Get profiles of users who sent requests
    const requestProfiles = await Promise.all(
        receivedRequests.map(async (senderId) => {
            const profile = await getUserProfile(senderId);
            return profile;
        })
    );
    
    return requestProfiles.filter(Boolean);
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



export const addFriend = async (friendId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    if (user.uid === friendId) throw new Error('Cannot add yourself as a friend');

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User profile not found');
    const userData = userSnap.data();
    const friends: string[] = userData.friends || [];
    if (friends.includes(friendId)) throw new Error('Friend already added');

    friends.push(friendId);
    await updateDoc(userRef, { friends });
};


export const removeFriend = async (friendId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User profile not found');
    const userData = userSnap.data();

    const friends: string[] = userData.friends || [];
    if (!friends.includes(friendId)) throw new Error('Friend not found in your list');
    const updatedFriends = friends.filter(id => id !== friendId);
    await updateDoc(userRef, { friends: updatedFriends });
};

export const getFriendsList = async () => {
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error('User profile not found');
    const userData = userSnap.data();
    const friends: string[] = userData.friends || [];
    return friends;
};