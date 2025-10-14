import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

import { CreatePartyParams, CreatePartyResponse, JoinPartyParams, PartyMember } from "../constants/party";

const createPartyFn = httpsCallable<CreatePartyParams, CreatePartyResponse>(functions, 'createParty');
const joinPartyFn = httpsCallable<JoinPartyParams, { success: boolean }>(functions, 'joinParty');
const getPartyDetailsFn = httpsCallable(functions, 'getPartyDetails');
const getMembersFn = httpsCallable(functions, 'getMembers');
const leavePartyFn = httpsCallable(functions, 'leaveParty');
const disbandPartyFn = httpsCallable(functions, 'disbandParty');

export const createParty = async (params: CreatePartyParams): Promise<CreatePartyResponse> => {
  try {
    const result = await createPartyFn(params);
    return result.data;
  } catch (error: any) {
    console.error('Create party error:', error);
    throw new Error(error.message || 'Failed to create party');
  }
};

export const joinParty = async (params: JoinPartyParams): Promise<{ success: boolean }> => {
  try {
    const result = await joinPartyFn(params);
    return result.data;
  } catch (error: any) {
    console.error('Join party error:', error);
    throw new Error(error.message || 'Failed to join party');
  }
};

export const getPartyDetails = async (partyId: string) => {
  try {
    const result = await getPartyDetailsFn({ partyId });
    return result.data;
  } catch (error: any) {
    console.error('Get party details error:', error);
    throw new Error(error.message || 'Failed to get party details');
  }
};

export const getPartyMembers = async (partyId: string): Promise<{ members: PartyMember[] }> => {
  try {
    const result = await getMembersFn({ partyId });
    return result.data as { members: PartyMember[] };
  } catch (error: any) {
    console.error('Get members error:', error);
    throw new Error(error.message || 'Failed to get members');
  }
};

export const leaveParty = async (partyId: string) => {
  try {
    const result = await leavePartyFn({ partyId });
    return result.data;
  } catch (error: any) {
    console.error('Leave party error:', error);
    throw new Error(error.message || 'Failed to leave party');
  }
};

export const disbandParty = async (partyId: string): Promise<{ success: boolean }> => {
  try {
    const result = await disbandPartyFn({ partyId });
    return result.data as { success: boolean };
  } catch (error: any) {
    console.error('Disband party error:', error);
    throw new Error(error.message || 'Failed to disband party');
  }
};