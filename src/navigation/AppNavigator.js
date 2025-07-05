import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// import HomeScreen from '../screens/HomeScreen';
import AddLogScreen from '../screens/AddLogScreen';
import MapScreen from '../screens/MapScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="AddLog" component={AddLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
