import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Image
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import GooglePlacesInput from '../components/GooglePlacesInput';

const AddLogScreen = ({ navigation }) => {
  const { user } = useAuth();
  const mapRef = useRef(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategorySelect = (category) => setSelectedCategory(category);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
      setLocationLoaded(true);
    })();
  }, []);

  const handleAddLog = async () => {
    if (!title || !selectedCategory || lat === null || lng === null) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'logs'), {
        title,
        selectedCategory,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        userId: user.uid,
        public: isPublic,
        createdAt: serverTimestamp()
      });

      Alert.alert('Log added!');
      setTitle('');
      setCategory('');
      setIsPublic(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Map' }]
      });
    } catch (error) {
      console.error('Error adding log:', error);
      Alert.alert('Error saving log.');
    }
  };

  const categoryOptions = ['Hike', 'Food', 'Attraction'];

  return (
    <View style={styles.container}>
        <View style={styles.page}>
            <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title..."
                placeholderTextColor="#888"
            />
            <View style={styles.underline} />

            <Text style={styles.label}>Search Location</Text>
            <GooglePlacesInput
                onPlaceSelected={({ location, description }) => {
                    setLat(location.lat);
                    setLng(location.lng);
                }}
            />

            {lat !== null && lng !== null && (
                <>
                <Text style={styles.label}>Location (drag the pin)</Text>
                <MapView
                    ref={mapRef} // 🆕 ref used for animating map
                    style={styles.map}
                    region={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                    }}
                >
                    <Marker
                    draggable
                    coordinate={{ latitude: lat, longitude: lng }}
                    onDragEnd={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setLat(latitude);
                        setLng(longitude);
                    }}
                    />
                </MapView>
                </>
            )}
        </View>

        <Image
            source={require('../../assets/Book-Spiral.png')}
            style={styles.spine}
            resizeMode="stretch"
        />

        <View style={styles.page}>
            <View style={styles.categoryContainer}>
                {['Hike', 'Food', 'Attraction'].map((cat) => (
                <TouchableOpacity
                    key={cat}
                    onPress={() => handleCategorySelect(cat)}
                    style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonSelected
                    ]}
                >
                    <Text style={styles.categoryText}>{cat}</Text>
                </TouchableOpacity>
                ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                <Text style={{ marginRight: 10 }}>Make this log public?</Text>
                <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>

            <Button title="Add Log" onPress={handleAddLog} />
        </View>
    </View>
  );
};

export default AddLogScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0d8c3' // beige-ish background behind pages
  },
  page: {
    flex: 0.49,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    paddingBottom: 10, // 🆕 gives extra space at the bottom
    backgroundColor: '#f8f1dd',
    borderColor: '#6b4e2e',
    borderWidth: 4,
    borderRadius: 12,
    overflow: 'hidden'
  },
    titleInput: {
    fontSize: 18,
    paddingVertical: 4,
    paddingHorizontal: 0,
    color: '#333',
    fontWeight: '500'
  },
    underline: {
    borderBottomWidth: 2,
    borderBottomColor: '#6b4e2e',
    marginBottom: 12,
    marginTop: -4
  },
  label: {
    fontWeight: 'bold',
    marginTop: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8
  },
  map: {
    height: 180,
    width: '100%',
    marginTop: 8
  },
  // 🆕 CATEGORY BUTTON STYLES
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  categoryButton: {
    backgroundColor: '#d2b48c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  categoryButtonSelected: {
    backgroundColor: '#8b5e3c'
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  // 🆕 SPINE
  spine: {
    position: 'absolute',
    top: '47%', // middle between the two "pages"
    left: 40,
    right: 0,
    height: 30,       // 🔧 Thinner image
    width: '80%',    // 🔄 Stretch horizontally to fit screen
    zIndex: 10,       // ✅ Keep it above the pages
    pointerEvents: 'none' // 👻 Prevents it from blocking taps
  }
});
