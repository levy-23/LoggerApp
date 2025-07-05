import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to Logger!</Text>
            <Button title="Add a New Log" onPress={() => navigation.navigate('Add Log')} />
            <Button title="View Logs on Map" onPress={() => navigation.navigate('Map')} />
        </View>
    );
};

export default HomeScreen;
