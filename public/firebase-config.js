// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrLm4hxslT2H_jaT6eQrAEK8swP55h6_c",
  authDomain: "jeysey-39fb6.firebaseapp.com",
  projectId: "jeysey-39fb6",
  storageBucket: "jeysey-39fb6.firebasestorage.app",
  messagingSenderId: "71940333413",
  appId: "1:71940333413:web:c9986db4e5e314d8124b8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
