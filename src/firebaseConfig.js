// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA7IY7Fnlaq7ekaSN-AMMO139qfUT1foaI",
    authDomain: "logger-102d8.firebaseapp.com",
    projectId: "logger-102d8",
    storageBucket: "logger-102d8.firebasestorage.app",
    messagingSenderId: "290977345745",
    appId: "1:290977345745:web:3cc593bff842e1269415f0"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
