import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Create callable function references
const sendFriendRequestFn = httpsCallable(functions, 'sendFriendRequest');
const acceptFriendRequestFn = httpsCallable(functions, 'acceptFriendRequest');
const rejectFriendRequestFn = httpsCallable(functions, 'rejectFriendRequest');
const getFriendSuggestionsFn = httpsCallable(functions, 'getFriendSuggestions');
const getPendingFriendRequestsFn = httpsCallable(functions, 'getPendingFriendRequests');
const getUserByNameFn = httpsCallable(functions, 'getUserByName');
const getUserByEmailFn = httpsCallable(functions, 'getUserByEmail');

export const sendFriendRequest = async (receiverId: string) => {
  try {
    const result = await sendFriendRequestFn({ receiverId });
    return result.data;
  } catch (error: any) {
    console.error('Send friend request error:', error);
    throw new Error(error.message || 'Failed to send friend request');
  }
};

export const acceptFriendRequest = async (requestId: string) => {
  try {
    const result = await acceptFriendRequestFn({ requestId });
    return result.data;
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    throw new Error(error.message || 'Failed to accept friend request');
  }
};

export const rejectFriendRequest = async (requestId: string) => {
  try {
    const result = await rejectFriendRequestFn({ requestId });
    return result.data;
  } catch (error: any) {
    console.error('Reject friend request error:', error);
    throw new Error(error.message || 'Failed to reject friend request');
  }
};

export const getFriendSuggestions = async () => {
  try {
    const result = await getFriendSuggestionsFn();
    return result.data;
  } catch (error: any) {
    console.error('Get friend suggestions error:', error);
    throw new Error(error.message || 'Failed to get friend suggestions');
  }
};

export const getUserByName = async (displayName: string) => {
  try {
    const result = await getUserByNameFn({ displayName });
    return result.data;
  } catch (error: any) {
    console.error('Get user by name error:', error);
    throw new Error(error.message || 'Failed to get user by name');
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const result = await getUserByEmailFn({ email });
    return result.data;
  } catch (error: any) {
    console.error('Get user by email error:', error);
    throw new Error(error.message || 'Failed to get user by email');
  }
};

export const getPendingFriendRequests = async () => {
  try {
    const result = await getPendingFriendRequestsFn();
    return result.data;
  } catch (error: any) {
    console.error('Get pending friend requests error:', error);
    throw new Error(error.message || 'Failed to get pending friend requests');
  }
};