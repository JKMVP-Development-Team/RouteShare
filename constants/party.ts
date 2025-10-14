

// All timestamps are stored as milliseconds (number) for consistency between client and server
// All parties are private by default and require invite codes

export interface PartyDocument {
  id: string;
  name: string;
  hostId: string; // Party leader
  createdAt: number;
  
  // Party settings
  maxMembers: number;
  inviteCode: string; // Invite code required to join
  qrCode: string; // QR code data URL for invites
    
  // Members and their states
  members: Array<{
    userId: string;
    joinedAt: number;
    role: 'host' | 'member';
    status: 'active' | 'inactive' | 'left';
  }>;
  
  // Current party state
  currentState: {
    status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled' | 'disbanded' | 'ended';
    currentWaypointIndex: number;
    startedAt?: number;
    pausedAt?: number;
    completedAt?: number;
    
    // Live tracking
    actualRoute?: Array<{
      latitude: number;
      longitude: number;
      timestamp: number;
      userId: string;
    }>;
  };
  
  // Pending changes that need host approval
  pendingChanges: Array<{
    id: string;
    type: 'add_stop' | 'modify_route' | 'skip_waypoint';
    requestedBy: string;
    requestedAt: number;
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
  timestamp: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  batteryLevel?: number;
  
  // Auto-expires after 5 minutes of inactivity
  expiresAt: number;
}


export interface ChangeRequestDocument {
  id: string;
  type: 'add_stop' | 'modify_route' | 'skip_waypoint' | 'change_destination';
  requestedBy: string;
  requestedAt: number;
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
    approvedAt?: number;
    declinedAt?: number;
    reason?: string;
  };
}


export interface CreatePartyParams {
  name: string;
  maxMembers?: number;
}

export interface CreatePartyResponse {
  partyId: string;
  inviteCode: string;
  qrCode: string;
}

export interface JoinPartyParams {
  partyId: string;
  inviteCode: string;
}

export interface PartyMember {
  userId: string;
  joinedAt: any;
  role: 'host' | 'member';
  status: 'active' | 'inactive' | 'left';
}