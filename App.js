import { useEffect } from 'react';
import { db } from './src/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { View, Text } from 'react-native';
import { useAuth } from './src/hooks/useAuth';

export default function App() {
  useEffect(() => {
    const addTestLog = async () => {
      try {
        await addDoc(collection(db, 'logs'), {
          title: 'Test Log from Expo',
          category: 'Hike',
          userId: 'test_user',
          createdAt: serverTimestamp(),
          location: { lat: 43.4675, lng: -80.5164 }
        });
        console.log('Test log added!');
      } catch (e) {
        console.error('Error adding test log:', e);
      }
    };

    addTestLog();
  }, []);

  const { user } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Logger App Connected to Firebase!</Text>
      {user ? (
        <Text>Welcome, user ID: {user.uid}</Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}
