import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, Platform, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // 🆕 Added useFocusEffect
import * as Location from 'expo-location';

const MapScreen = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const navigation = useNavigation();

  // 🆕 Refactored fetch logic into reusable function
  const fetchLogsAndLocation = useCallback(async () => {
    if (!user) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const snapshot = await getDocs(collection(db, 'logs'));
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.public || doc.userId === user.uid);

      setLogs(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 🆕 Re-run every time screen regains focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchLogsAndLocation();
    }, [fetchLogsAndLocation])
  );

  if (!user || loading || !userLocation) {
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
        style={{ flex: 1 }}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
      >
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor="green"
        />

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
        onPress={() => navigation.navigate('AddLog', {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        })}
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
    backgroundColor: '#2196F3',
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
