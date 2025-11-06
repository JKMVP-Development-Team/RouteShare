
// Could Use UserInfoInterface from Firebase

import { Timestamp } from "firebase/firestore";

// https://firebase.google.com/docs/reference/unity/class/firebase/auth/user-info-interface
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    joinedAt: Timestamp;
    lastSeen?: Timestamp;
    role: 'rider' | 'driver' | 'manager';

    currentLocation?: {
        latitude: number;
        longitude: number;
        timestamp: Timestamp;
        accuracy?: number; // in meters
        heading?: number; // in degrees
        speed?: number; // in m/s
    };

    // Friend system
    friends: string[]; // Array of User IDs
    sentFriendRequests: string[]; // Array of User IDs
    receivedFriendRequests: string[]; // Array of User IDs

    stats: {
        routesCreated: number;
        partiesJoined: number;
        totalDistance: number;
    };
    preferences: {
        units: 'metric' | 'imperial';
        privacy: 'public' | 'friends' | 'private';
        shareLocation: boolean;
        notifications: {
            friendRequests: boolean;
            partyInvites: boolean;
            routeChanges: boolean;
        }
    };

    // Device Info for push notifications
    fcmTokens?: string;
    platform?: 'ios' | 'android';
}

// Won't need to handle insurance/background check as the manager will handle that already
export interface DriverUserProfile extends UserProfile {
    role: 'driver';
    licenseNumber: string;
    vehicleInfo: {
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        color?: string;
        vehicleType?: 'suv' | 'sedan' | 'truck' | 'van';
        vehicleCapacity?: number;
    };
}

export interface RiderUserProfile extends UserProfile {
    role: 'rider';
    preferredTimes: string[];
}

export interface ManagerUserProfile extends UserProfile {
    role: 'manager';
    driverIds: string[]; // Managed drivers
}