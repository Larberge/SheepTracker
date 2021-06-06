import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
    <Stack.Screen name="Registrer" component={RegisterScreen} options={{headerShown: false}}/>
  </Stack.Navigator>
);

export default AuthNavigator;
