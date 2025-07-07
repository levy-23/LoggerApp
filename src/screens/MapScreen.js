import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Platform, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const MapScreen = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null); // 🆕 store user location
  const mapRef = useRef(null); // 🆕 ref for animating map
  const navigation = useNavigation();

  // 🆕 Get user's current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        // 🆕 Animate to user's location when available
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }, 1000);
      }
    })();
  }, []);

  // Load logs
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
  }, [user]);

  if (!user || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Map is not supported on web. Please run on iOS or Android.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef} // 🆕 connect ref
        style={{ flex: 1 }}
        showsUserLocation // 🆕 shows green dot
        initialRegion={{
          latitude: userLocation?.latitude || 43.651,
          longitude: userLocation?.longitude || -79.347,
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLog')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    // backgroundColor: '#2196F3',
    backgroundColor: '#8b5e3c',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    marginTop: -2
  }
});
