import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { Switch } from 'react-native';
import * as Location from 'expo-location';

const AddLogScreen = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLat(location.coords.latitude.toString());
        setLng(location.coords.longitude.toString());
        })();
    }, []);

    const handleAddLog = async () => {    
        if (!title || !category || !lat || !lng) {
            Alert.alert('Please fill in all fields.');
            return;
        }

        try {
            await addDoc(collection(db, 'logs'), {
                title,
                category,
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
            setLat('');
            setLng('');
            setIsPublic(false);
        } catch (error) {
            console.error('Error adding log:', error);
            Alert.alert('Error saving log.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Log Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Sunset Hike" />

            <Text style={styles.label}>Category</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Hike, Cafe" />

            <Text style={styles.label}>Latitude</Text>
            <TextInput style={styles.input} value={lat} onChangeText={setLat} keyboardType="numeric" />

            <Text style={styles.label}>Longitude</Text>
            <TextInput style={styles.input} value={lng} onChangeText={setLng} keyboardType="numeric" />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                <Text style={{ marginRight: 10 }}>Make this log public?</Text>
                <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>

            <Button title="Add Log" onPress={handleAddLog} />
        </View>
    );
};

export default AddLogScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        gap: 12
    },
    label: {
        fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 6,
        padding: 8
    }
});
