import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const MapScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, 'logs'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 43.651, // Default location
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
        />
      ))}
    </MapView>
  );
};

export default MapScreen;
