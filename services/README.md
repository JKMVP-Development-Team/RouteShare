# Services

Client-side services for RouteShare mobile app. These services run on the user's device and interact directly with Firebase or make HTTP calls to Cloud Functions.

## Overview

The services folder contains client-side utilities that your React Native components use to:
- Authenticate users
- Manage user profiles and friends
- Make secure API calls to server functions

## Files

### `firebase.ts`
Firebase configuration and initialization for the client app.

### `auth.ts`
Authentication services using Firebase Auth.

### `user.ts`
User profile management and friend system services.

## Usage

### Authentication

```typescript
import { signIn, signUp, signOut } from '@/services/auth';

// Sign in a user
try {
  const user = await signIn('user@example.com', 'password123');
  console.log('Signed in:', user.uid);
} catch (error) {
  console.error('Sign in failed:', error.message);
}

// Sign up a new user
try {
  const user = await signUp('newuser@example.com', 'password123');
  console.log('User created:', user.uid);
} catch (error) {
  console.error('Sign up failed:', error.message);
}

// Sign out
await signOut();
```

### User Profile Management

```typescript
import { 
  createUserProfile, 
  getUserProfile, 
  updateUserProfile 
} from '@/services/user';

// Create user profile (after sign up)
const profileData = {
  displayName: 'John Doe',
  bio: 'Love hiking and running!',
  location: 'San Francisco',
  preferences: {
    units: 'metric',
    privacy: 'public'
  }
};

try {
  const profile = await createUserProfile(profileData);
  console.log('Profile created:', profile);
} catch (error) {
  console.error('Failed to create profile:', error);
}

// Get any user's profile
const profile = await getUserProfile('user-id-123');

// Update your own profile
await updateUserProfile({
  bio: 'Updated bio text',
  location: 'New York'
});
```

### Friend System

#### Basic Friend Management (Client-side operations)
```typescript
import { 
  addFriend, 
  removeFriend, 
  getFriendsList 
} from '@/services/user';

// Add friend directly (bypasses friend requests)
await addFriend('friend-user-id');

// Remove friend
await removeFriend('friend-user-id');

// Get your friends list
const friends = await getFriendsList();
```

#### Friend Requests (Server-side operations)
```typescript
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  getPendingFriendRequests,
  getFriendSuggestions 
} from '@/services/user';

// Send friend request
try {
  await sendFriendRequest('target-user-id');
  alert('Friend request sent!');
} catch (error) {
  alert(error.message);
}

// Accept friend request
await acceptFriendRequest('sender-user-id');

// Decline friend request
await declineFriendRequest('sender-user-id');

// Get pending requests
const pendingRequests = await getPendingFriendRequests();

// Get friend suggestions
const { suggestions } = await getFriendSuggestions();
```

#### Real-time Friend Requests
```typescript
import { onFriendRequestsChange } from '@/services/user';

// Listen for real-time friend request changes
const unsubscribe = onFriendRequestsChange((requests) => {
  console.log('Updated friend requests:', requests);
  // Update your UI with new requests
});

// Don't forget to unsubscribe when component unmounts
useEffect(() => {
  return unsubscribe;
}, []);
```

### Error Handling

All services throw errors that you should handle:

```typescript
try {
  await sendFriendRequest('user-id');
} catch (error) {
  // Handle specific errors
  if (error.message.includes('already friends')) {
    alert('You are already friends with this user');
  } else if (error.message.includes('already sent')) {
    alert('Friend request already sent');
  } else {
    alert('Failed to send friend request');
  }
}
```

## Environment Variables

Make sure to set these in your `.env` file:

```env
# For server function calls
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5001/routeshare-b1b01/us-central1

# Or for production:
# NEXT_PUBLIC_API_BASE_URL=https://us-central1-routeshare-b1b01.cloudfunctions.net
```

## Integration with Auth Hook

These services work seamlessly with your auth hook:

```typescript
// In your component
import { useAuth } from '@/hooks';
import { createUserProfile } from '@/services/user';

function ProfileSetup() {
  const { currentUser, userLoggedIn } = useAuth();
  
  const handleCreateProfile = async (profileData) => {
    if (!userLoggedIn) return;
    
    try {
      await createUserProfile(profileData);
      // Profile created successfully
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  };
  
  return (
    // Your profile setup UI
  );
}
```

## Client vs Server Operations

### Client-side (Direct Firebase)
- ✅ Read your own data
- ✅ Simple profile updates
- ✅ Real-time listeners
- ✅ File uploads

### Server-side (Cloud Functions)
- ✅ Friend requests (affects multiple users)
- ✅ Complex business logic
- ✅ Push notifications
- ✅ Data validation

Choose client-side for simple operations, server-side for complex operations that affect multiple users or require special permissions.