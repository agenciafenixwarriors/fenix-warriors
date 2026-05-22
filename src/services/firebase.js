import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

import { getStorage } from "firebase/storage";

import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBds6Q8iIq0UITHkSnK0aE4Xf9XkjNocKI",

  authDomain: "fenix-warriors-ff72e.firebaseapp.com",

  projectId: "fenix-warriors-ff72e",

  storageBucket: "fenix-warriors-ff72e.firebasestorage.app",

  messagingSenderId: "90891959036",

  appId: "1:90891959036:web:c1d34de94f63c2fceaf579",

  measurementId: "G-08YK41PSQ0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

// Analytics seguro
let analytics = null;

isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

export { analytics };

export default app;