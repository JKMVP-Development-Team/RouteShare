import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updatePassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string, displayName?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update the user profile with display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });
    
    // Manually sync to Firestore (needed for emulators and as backup)
    // In production, the Auth trigger will handle this, but this ensures it works everywhere
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      displayName: displayName,
      displayNameLower: displayName.toLowerCase(),
      emailLower: (userCredential.user.email || '').toLowerCase(),
      photoURL: userCredential.user.photoURL || null,
      createdAt: Date.now(),
      friends: [],
      sentFriendRequests: [],
      receivedFriendRequests: [],
      stats: { routesCreated: 0, partiesJoined: 0, totalDistance: 0 },
      preferences: { units: 'metric', privacy: 'public' },
    });
  }
  
  return userCredential;
};



export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  return result;
}


export const doSignOut = () => {
  return auth.signOut();
}

export const doPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
}

export const doPasswordChange = (password: string) => {
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in');
  }
  return updatePassword(auth.currentUser, password);
}

export const doSendEmailVerification = () => {
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in');
  }
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
}

