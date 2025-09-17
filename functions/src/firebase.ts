// import { getAnalytics } from "firebase/analytics"; // TODO: Explore this later
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBonxHWOQiVV6a8p3XvxFAwYPLp18qaEfc",
  authDomain: "routeshare-b1b01.firebaseapp.com",
  projectId: "routeshare-b1b01",
  storageBucket: "routeshare-b1b01.firebasestorage.app",
  messagingSenderId: "619122582619",
  appId: "1:619122582619:web:e87b1a98c02c6fc782cb7e",
  measurementId: "G-P3XKPXHXPJ"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage };
