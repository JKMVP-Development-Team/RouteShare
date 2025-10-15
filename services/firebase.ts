// import { getAnalytics } from "firebase/analytics"; // TODO: Explore this later
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_FIREBASE_API_KEY. Make sure you have a .env file and run Expo with "expo start --env-file .env".'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain: "routeshare-b1b01.firebaseapp.com",
  projectId: "routeshare-b1b01",
  messagingSenderId: "619122582619",
  appId: "1:619122582619:web:e87b1a98c02c6fc782cb7e",
  measurementId: "G-P3XKPXHXPJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (__DEV__) {
  // For Android Emulator, use 10.0.2.2 to access localhost
  // For iOS Simulator or physical device on same network, use your computer's IP
  const envPrimaryHost = process.env.EXPO_PUBLIC_FUNCTIONS_HOST || process.env.EXPO_PUBLIC_IP_ADDRESS;
  const envWebHost = process.env.EXPO_PUBLIC_FUNCTIONS_HOST_WEB;

  let EMULATOR_HOST: string;

  if (Platform.OS === 'web') {
    EMULATOR_HOST = envWebHost || 'localhost';
  } else if (Platform.OS === 'android') {
    EMULATOR_HOST = envPrimaryHost || '10.0.2.2';
  } else {
    EMULATOR_HOST = envPrimaryHost || 'localhost';
  }
  
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

