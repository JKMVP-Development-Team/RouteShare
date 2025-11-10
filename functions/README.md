# Cloud Functions

Server-side functions for RouteShare app. These functions run on Google Cloud and provide secure backend operations that can't be performed client-side.

## Overview

Cloud Functions handle:
- Admin operations (user management)
- Complex business logic (friend requests, party management)
- Operations affecting multiple users
- Push notifications
- Data validation and security

## Project Structure

```
functions/
├── src/                    # TypeScript source code
│   ├── auth.ts            # User authentication admin functions
│   ├── user.ts            # Friend system functions
│   ├── routes.ts          # Route management functions
│   ├── party.ts           # Party system functions
│   ├── storage.ts         # File storage functions
│   └── index.ts           # Main entry point - exports all functions
├── lib/                   # Compiled JavaScript (auto-generated)
└── package.json           # Dependencies and scripts
```

## Available Functions

### Authentication Functions (`auth.ts`)

#### `createUser` (Admin only)
Creates a new user account programmatically.

**URL:** `POST /createUser`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "uid": "user-id-123",
  "email": "user@example.com"
}
```

#### `deleteUser` (Admin only)
Deletes a user account and all associated data.

**URL:** `POST /deleteUser`

**Body:**
```json
{
  "uid": "user-id-to-delete"
}
```

### Friend System Functions (`user.ts`)

#### `sendFriendRequest`
Sends a friend request between two users.

**URL:** `POST /sendFriendRequest`

**Headers:** `Authorization: Bearer <user-token>`

**Body:**
```json
{
  "receiverId": "target-user-id"
}
```

**Features:**
- Validates users exist
- Prevents duplicate requests
- Prevents self-requests
- Updates both users atomically
- Can trigger push notifications

#### `acceptFriendRequest`
Accepts a pending friend request.

**URL:** `POST /acceptFriendRequest`

**Headers:** `Authorization: Bearer <user-token>`

**Body:**
```json
{
  "senderId": "user-who-sent-request"
}
```

**What it does:**
- Adds both users to each other's friends list
- Removes the request from both users
- Atomic operation (all or nothing)

#### `rejectFriendRequest`
Rejects a pending friend request.

**URL:** `POST /rejectFriendRequest`

**Headers:** `Authorization: Bearer <user-token>`

**Body:**
```json
{
  "senderId": "user-who-sent-request"
}
```

#### `getFriendSuggestions`
Gets intelligent friend suggestions for a user.

**URL:** `GET /getFriendSuggestions`

**Headers:** `Authorization: Bearer <user-token>`

**Response:**
```json
{
  "suggestions": [
    {
      "userId": "suggested-user-id",
      "displayName": "Jane Smith",
      "photoURL": "https://...",
      "mutualFriends": 3,
      "score": 35,
      "location": "San Francisco"
    }
  ]
}
```

**Algorithm considers:**
- Mutual friends (heavily weighted)
- Location proximity
- Privacy settings
- Existing friends/requests

### Route Functions (`routes.ts`)

#### `createRoute`
Creates a new route with server-side validation.

#### `getUserRoutes`
Gets all routes for a specific user.

#### `deleteRoute`
Deletes a route (with ownership verification).

#### `onRouteCreated` (Trigger)
Automatically runs when a new route is created:
- Updates user statistics
- Notifies party members
- Processes route with Google Maps API

## Development Setup

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Set Environment Variables
```bash
# Set your Google Maps API key
firebase functions:config:set google.maps_api_key="your-api-key"

# Or for local development, add to .env file
```

### 3. Start Emulators
```bash
# From project root
firebase emulators:start

# Or just functions
firebase emulators:start --only functions
```

**Local URLs:**
- Functions: `http://localhost:5001/routeshare-b1b01/us-central1`
- Emulator UI: `http://localhost:4000`

### 4. Build Functions
```bash
cd functions
npm run build
```

### 5. Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendFriendRequest
```

## Testing Functions

### Using HTTP Client (Postman/Thunder Client)

#### Test Admin Functions (No auth required)
```bash
# Create user
POST http://localhost:5001/routeshare-b1b01/us-central1/createUser
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "testpass123",
  "displayName": "Test User"
}
```

#### Test User Functions (Auth required)

1. First, get an auth token:
```javascript
// In your app or browser console
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log(token); // Copy this token
```

2. Use token in requests:
```bash
POST http://localhost:5001/routeshare-b1b01/us-central1/sendFriendRequest
Authorization: Bearer <your-token-here>
Content-Type: application/json

{
  "receiverId": "target-user-id"
}
```

### Using Your Mobile App

```typescript
// Your app automatically handles tokens
import { sendFriendRequest } from '@/services/user';

const handleSendRequest = async () => {
  try {
    await sendFriendRequest('target-user-id');
    console.log('Friend request sent!');
  } catch (error) {
    console.error('Failed:', error.message);
  }
};
```

## Security

### Authentication
All user functions require valid Firebase Auth tokens:

```typescript
const verifyUser = async (req) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid; // Returns verified user ID
};
```

### Authorization
Functions check that users can only perform actions they're authorized for:

```typescript
// Users can only delete their own routes
const routeData = await getRouteData(routeId);
if (routeData.userId !== verifiedUserId) {
  throw new Error('Not authorized');
}
```

### Data Validation
All inputs are validated before processing:

```typescript
if (!receiverId) {
  return res.status(400).json({ error: 'Receiver ID is required' });
}

if (senderId === receiverId) {
  return res.status(400).json({ error: 'Cannot send request to yourself' });
}
```

## Error Handling

Functions return consistent error responses:

```json
{
  "error": "Human-readable error message"
}
```

**Common HTTP status codes:**
- `400` - Bad request (missing/invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not allowed to perform action)
- `404` - Not found (user/resource doesn't exist)
- `500` - Server error (unexpected error)

## Production Deployment

### Environment Setup
```bash
# Set production config
firebase functions:config:set \
  google.maps_api_key="prod-api-key" \
  fcm.server_key="prod-fcm-key"
```

### Deploy
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy with specific project
firebase deploy --only functions --project routeshare-production
```

**Production URLs:**
- Base: `https://us-central1-routeshare-b1b01.cloudfunctions.net`
- Function: `https://us-central1-routeshare-b1b01.cloudfunctions.net/sendFriendRequest`

## Monitoring

### View Logs
```bash
# View function logs
firebase functions:log

# View specific function
firebase functions:log --only sendFriendRequest
```

### Firebase Console
- Monitor function usage: [Firebase Console](https://console.firebase.google.com)
- View performance metrics
- Check error rates
- Monitor costs

## Best Practices

1. **Always verify user tokens** for user functions
2. **Use atomic operations** (batches) for multi-document updates
3. **Validate all inputs** before processing
4. **Handle errors gracefully** with descriptive messages
5. **Log important operations** for debugging
6. **Use TypeScript** for better type safety
7. **Test functions locally** before deploying

## Adding New Functions

1. Create function in appropriate file (`auth.ts`, `user.ts`, etc.)
2. Add to exports in `index.ts`
3. Test locally with emulators
4. Deploy to production
5. Update client services to call new function

```typescript
// Example new function
export const newFunction = onRequest(async (req, res) => {
  try {
    const userId = await verifyUser(req);
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```