import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebaseConfig';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Create user doc on first login
        const userDoc = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDoc);

        if (!docSnap.exists()) {
          await setDoc(userDoc, {
            createdAt: serverTimestamp(),
            username: 'Anonymous'
          });
        }
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign-in error:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  return { user };
};
