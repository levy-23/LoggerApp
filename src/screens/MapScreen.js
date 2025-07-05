import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';

const MapScreen = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 Only fetch logs after user is available
  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'logs'));
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(doc => doc.public || doc.userId === user.uid);

        setLogs(data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]); // 🆕 will re-run once user loads

  // 🆕 show loading spinner until user is ready
  if (!user || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🆕 fallback for web platform
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Map is not supported on web. Please run on iOS or Android.</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 43.651,
        longitude: -79.347,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      }}
    >
      {logs.map(log => (
        <Marker
          key={log.id}
          coordinate={{
            latitude: log.location.lat,
            longitude: log.location.lng
          }}
          title={log.title}
          description={log.category}
          pinColor={log.userId === user.uid ? 'red' : log.public === true && 'blue'}
        />
      ))}
    </MapView>
  );
};

export default MapScreen;
