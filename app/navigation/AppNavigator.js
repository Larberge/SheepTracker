import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen.js";
import RecordScreen from "../screens/RecordScreen.js";

const Stack = createStackNavigator();

const AppNavigator = () => (
    <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Record" component={RecordScreen} options={{headerShown: false}}/>
    </Stack.Navigator>
  );

export default AppNavigator;



