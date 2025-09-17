import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, updatePassword } from 'firebase/auth';
import { auth } from './firebase';

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
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

