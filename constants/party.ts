

import { Timestamp } from 'firebase/firestore';

export interface PartyDocument {
  id: string;
  name: string;
  routeId: string;
  hostId: string; // Party leader
  createdAt: Timestamp;
  
  // Party settings
  maxMembers: number;
  isPrivate: boolean;
  inviteCode?: Promise<{
    inviteCode: string;
    qrCode: string;
  }>; // For joining private parties
  
  // Members and their states
  members: Array<{
    userId: string;
    joinedAt: Timestamp;
    role: 'host' | 'member';
    status: 'active' | 'inactive' | 'left';
  }>;
  
  // Current party state
  currentState: {
    status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
    currentWaypointIndex: number;
    startedAt?: Timestamp;
    pausedAt?: Timestamp;
    completedAt?: Timestamp;
    
    // Live tracking
    actualRoute?: Array<{
      latitude: number;
      longitude: number;
      timestamp: Timestamp;
      userId: string;
    }>;
  };
  
  // Pending changes that need host approval
  pendingChanges: Array<{
    id: string;
    type: 'add_stop' | 'modify_route' | 'skip_waypoint';
    requestedBy: string;
    requestedAt: Timestamp;
    status: 'pending' | 'approved' | 'declined';
    data: any; // Specific change data
  }>;
  
  stats: {
    totalDistance: number;
    totalTime: number;
    averageSpeed: number;
    stopsCompleted: number;
  };
}


export interface LiveLocationDocument {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Timestamp;
  accuracy: number;
  heading?: number;
  speed?: number;
  batteryLevel?: number;
  
  // Auto-expires after 5 minutes of inactivity
  expiresAt: Timestamp;
}


export interface ChangeRequestDocument {
  id: string;
  type: 'add_stop' | 'modify_route' | 'skip_waypoint' | 'change_destination';
  requestedBy: string;
  requestedAt: Timestamp;
  status: 'pending' | 'approved' | 'declined';
  
  // Request-specific data
  data: {
    // For add_stop
    newWaypoint?: {
      latitude: number;
      longitude: number;
      address?: string;
      name: string;
      reason?: string;
    };

  };
  
  // Host response
  hostResponse?: {
    approvedAt?: Timestamp;
    declinedAt?: Timestamp;
    reason?: string;
  };
}