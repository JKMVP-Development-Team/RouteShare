
// Could Use UserInfoInterface from Firebase
// https://firebase.google.com/docs/reference/unity/class/firebase/auth/user-info-interface
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    joinedAt: Date;
    stats: {
        routesCreated: number;
        partiesJoined: number;
        totalDistance: number;
    };
    preferences: {
    units: 'metric' | 'imperial';
    privacy: 'public' | 'friends' | 'private';
    };
}