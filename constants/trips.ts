


export interface TripDocument {
    id: string;
    clientId: string;
    createdAt: number;
    fromLocation: {
      latitude: number;
      longitude: number;
        address?: string;
    };
    toLocation: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    scheduledAt: number;
    departedAt?: number;
    arrivedAt?: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
    driverId?: string;
    vehicleId?: string;
    rating?: number; // 1 to 5
    feedback?: string;
}

export interface VehicleDocument {
    id: string;
    driverId: string;
    driverName: string;
    licensePlate: string;
    vehicleType: 'suv' | 'sedan' | 'van';
    capacity: number; // number of passengers
    // Current location of the driver(vehicle) from user schema
    status: 'available' | 'on_trip' | 'offline';
}

export interface RiderDocument {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;

    vehicleId?: string; // assigned vehicle
    // Get location of rider from user schema
}

export interface AssignmentDocument {
    id: string;
    tripId: string;
    riderId: string;
    assignedAt: number;
    status: 'assigned' | 'picked_up' | 'dropped_off' | 'canceled';
    pickupLocation: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    dropoffLocation: {  
        latitude: number;
        longitude: number;
        address?: string;
    };

    driverId: string;
    vehicleId: string;
}