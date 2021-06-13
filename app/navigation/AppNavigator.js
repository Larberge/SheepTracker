import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen.js";
import RecordScreen from "../screens/RecordScreen.js";

const Stack = createStackNavigator();


/**
 * The navigation component of the appliation.
 * @component
 * @returns {Stack.Navigator} Navigator component with all screens to navigate between.
 */
const AppNavigator = () => (
    <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Record" component={RecordScreen} options={{headerShown: false}}/>
    </Stack.Navigator>
  );

export default AppNavigator;



