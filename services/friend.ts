import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Create callable function references
const sendFriendRequestFn = httpsCallable(functions, 'sendFriendRequest');
const acceptFriendRequestFn = httpsCallable(functions, 'acceptFriendRequest');
const rejectFriendRequestFn = httpsCallable(functions, 'rejectFriendRequest');
const cancelFriendRequestFn = httpsCallable(functions, 'cancelFriendRequest');
const getFriendSuggestionsFn = httpsCallable(functions, 'getFriendSuggestions');
const getPendingFriendRequestsFn = httpsCallable(functions, 'getPendingFriendRequests');
const getUserByNameFn = httpsCallable(functions, 'getUserByName');
const getUserByEmailFn = httpsCallable(functions, 'getUserByEmail');
const getFriendsListFn = httpsCallable(functions, 'getFriendsList');

export const sendFriendRequest = async (receiverId: string) => {
  try {
    console.log('Sending friend request to:', receiverId);
    const result = await sendFriendRequestFn({ receiverId });
    console.log('Send friend request result:', result.data);
    return result.data;
  } catch (error: any) {
    console.error('Send friend request error:', error);
    throw new Error(error.message || 'Failed to send friend request');
  }
};

export const acceptFriendRequest = async (senderId: string) => {
  try {
    console.log('Accepting friend request from:', senderId);
    const result = await acceptFriendRequestFn({ senderId });
    console.log('Accept friend request result:', result.data);
    return result.data;
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    throw new Error(error.message || 'Failed to accept friend request');
  }
};

export const rejectFriendRequest = async (senderId: string) => {
  try {
    console.log('Rejecting friend request from:', senderId);
    const result = await rejectFriendRequestFn({ senderId });
    console.log('Reject friend request result:', result.data);
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

export const cancelFriendRequest = async (receiverId: string) => {
  try {
    console.log('Cancelling friend request to:', receiverId);
    const result = await cancelFriendRequestFn({ receiverId });
    console.log('Cancel friend request result:', result.data);
    return result.data;
  } catch (error: any) {
    console.error('Cancel friend request error:', error);
    throw new Error(error.message || 'Failed to cancel friend request');
  }
};

export const getFriendsList = async () => {
  try {
    const result = await getFriendsListFn();
    return result.data;
  } catch (error: any) {
    console.error('Get friends list error:', error);
    throw new Error(error.message || 'Failed to get friends list');
  }
};