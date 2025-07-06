import React, { useState } from 'react';
import {
    View,
    TextInput,
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import Constants from 'expo-constants';

const GOOGLE_API_KEY = Constants.expoConfig.extra.googlePlacesApiKey;

const GooglePlacesInput = ({ onPlaceSelected }) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const fetchPlaces = async (text) => {
        setInput(text);
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
        )}&key=${GOOGLE_API_KEY}&language=en`;

        try {
            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'OK') {
                setSuggestions(json.predictions);
            } else {
                console.warn('Places API error:', json.status);
                setSuggestions([]);
            }
        } catch (err) {
            console.error('Places fetch failed:', err);
        }
    };

    const handleSelect = async (place) => {
        setInput(place.description);
        setSuggestions([]);

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_API_KEY}`;

        try {
            const res = await fetch(detailsUrl);
            const json = await res.json();

            if (json.status === 'OK') {
                const loc = json.result.geometry.location;
                onPlaceSelected({
                    description: place.description,
                    location: {
                        lat: loc.lat,
                        lng: loc.lng
                    }
                });
            }
        } catch (e) {
            console.error('Place details fetch failed:', e);
        }
    };

    return (
        <View>
            <TextInput
                value={input}
                onChangeText={fetchPlaces}
                placeholder="Search places"
                style={styles.input}
            />
            <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.suggestion}
                        onPress={() => handleSelect(item)}
                    >
                        <Text>{item.description}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default GooglePlacesInput;

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        padding: 10,
        marginBottom: 6
    },
    suggestion: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#eee'
    }
});
