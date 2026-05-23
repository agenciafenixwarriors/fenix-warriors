import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOb4DIg__xF1cOO_5u44tB2WybWnQKu2g",
  authDomain: "fenix-warriors-17e37.firebaseapp.com",
  projectId: "fenix-warriors-17e37",
  storageBucket: "fenix-warriors-17e37.firebasestorage.app",
  messagingSenderId: "364176960493",
  appId: "1:364176960493:web:48150b563b354dbff355e4",
  measurementId: "G-M4XSNTM2LE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;