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
    const [notes, setNotes] = useState('');


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
                notes,
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

                <Text style={styles.notes}>Search Location</Text>
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
                {/* <View style={styles.categoryContainer}>
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
            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Write your thoughts, tips, or memories here..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                <Text style={{ marginRight: 10 }}>Make this log public?</Text>
                <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>

            <Button title="Add Log" onPress={handleAddLog} /> */}
                <View style={styles.gridRow}>
                    <View style={styles.cell}>
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
                    </View>
                    <View style={styles.cell}>
                        <View style={[styles.imagePlaceholder, styles.topImagePlaceholder]} />
                    </View>
                </View>

                <View style={styles.gridRowMiddle}>
                    <View style={styles.leftCell}>
                        <View style={[styles.imagePlaceholder, styles.middleImagePlaceholder]} />
                    </View>
                    <View style={styles.rightCell}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={styles.notesInput}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Write your thoughts, tips, or memories here..."
                            placeholderTextColor="#667"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={styles.gridRowLast}>
                    <View style={styles.cell}>
                        <View style={styles.bottomLeftGroup}>
                            <View style={styles.publicRow}>
                                <Text style={styles.publicText}>Make public?</Text>
                                <Switch value={isPublic} onValueChange={setIsPublic} />
                            </View>
                            <TouchableOpacity style={styles.addLogButton} onPress={handleAddLog}>
                                <Text style={styles.addLogButtonText}>Add Log</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.cell}>
                        <View style={[styles.imagePlaceholder, styles.bottomImagePlaceholder]} />
                    </View>
                </View>

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
        flexWrap: 'wrap',
        maxWidth: '100%',
        marginBottom: 8,
        rowGap: 6,
        columnGap: 6
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
    },
    notesInput: {
        backgroundColor: '#fef9e7', // subtle paper-yellow
        borderColor: '#d2b48c',     // tan border
        borderWidth: 2,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        textAlignVertical: 'top',
        marginBottom: 12
    },
    gridRow: {
        flexDirection: 'row',
        height: '20%',
        paddingBottom: 4,
        gap: 12
    },
    gridRowMiddle: {
        flexDirection: 'row',
        height: '60%',
        paddingBottom: 4,
        gap: 12
    },
    gridRowLast: {
        flexDirection: 'row',
        height: '20%',
        paddingBottom: 4,
        gap: 12
    },
    cell: {
        flex: 1,
        justifyContent: 'flex-start',
        position: 'relative'
    },
    imagePlaceholder: {
        backgroundColor: '#ddd',
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#aaa'
    },
    notesInput: {
        backgroundColor: '#fef9e7',
        borderColor: '#d2b48c',
        borderWidth: 2,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        textAlignVertical: 'top'
    },
    bottomLeftGroup: {
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    addLogButton: {
        backgroundColor: '#8b5e3c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start'
    },
    addLogButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    publicRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    publicText: {
        marginRight: 8
    },
    middleImagePlaceholder: {
        width: 180,        // Must match fixedLeftCell width
        height: 180,       // You can keep it square
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#aaa',
        backgroundColor: '#ddd'
    },
    topImagePlaceholder: {
        width: '60%',        // smaller width than default
        aspectRatio: 1,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#aaa',
        backgroundColor: '#ddd',
        right: 0,
        position: 'absolute',
        top: 0
    },
    bottomImagePlaceholder: {
        width: '80%',        // smaller width than default
        aspectRatio: 1,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#aaa',
        backgroundColor: '#ddd',
        right: 0,
        position: 'absolute',
        bottom: 0
    },
    leftCell: {
        width: 180, // Match the width of your smaller image
        marginRight: 1 // Optional spacing
    },

    rightCell: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 20
    }

});
