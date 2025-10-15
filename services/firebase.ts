// import { getAnalytics } from "firebase/analytics"; // TODO: Explore this later
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "routeshare-b1b01.firebaseapp.com",
  projectId: "routeshare-b1b01",
  messagingSenderId: "619122582619",
  appId: "1:619122582619:web:e87b1a98c02c6fc782cb7e",
  measurementId: "G-P3XKPXHXPJ"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (__DEV__) {
  // For Android Emulator, use 10.0.2.2 to access localhost
  // For iOS Simulator or physical device on same network, use your computer's IP
  const EMULATOR_HOST = process.env.IP_ADDRESS || '';
  
  try {
    const authUrl = `http://${EMULATOR_HOST}:9099`;
    console.log("🔐 Connecting Auth emulator:", authUrl);
    connectAuthEmulator(auth, authUrl, { disableWarnings: true });
    console.log("✅ Auth emulator connected");
    
    console.log("📦 Connecting Firestore emulator:", EMULATOR_HOST, ":8082");
    connectFirestoreEmulator(db, EMULATOR_HOST, 8082);
    console.log("✅ Firestore emulator connected");
    
    console.log("⚡ Connecting Functions emulator:", EMULATOR_HOST, ":5001");
    connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
    console.log("✅ Functions emulator connected");
    
    console.log("🔧 All emulators connected successfully!");
  } catch (error) {
    console.error("❌ Firebase emulators connection error:", error);
  }
}

export { app, auth, db, functions };

