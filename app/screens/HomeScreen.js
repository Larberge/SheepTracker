import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import { appColors } from "../config";
import BottomNav from "../components/BottomNav";
import Dialog from "../components/Dialog";
import InternetBar from "../components/InternetBar";
import AccountScreen from "./AccountScreen.js";
import ReportScreen from "./ReportScreen.js";
import ReportlistScreen from "./ReportlistScreen";
import Header from "../components/Header";
import { useTitle } from "../hooks";

const NewstedStack = createStackNavigator();


/**
 * Funtion returning the overall navigaion stack of the application
 * @return {Stacknavigator} Navigator to he used in the app
 */
const StackNavigator = () => {
  return (
    <NewstedStack.Navigator initialRouteName="Home">
      <NewstedStack.Screen
        name="Home"
        component={ReportlistScreen}
        options={{
          headerShown: false,
        }}
      />
      <NewstedStack.Screen
        name="Report"
        component={ReportScreen}
        options={{
          headerShown: false,
        }}
      />
      <NewstedStack.Screen
        name="Profil"
        component={AccountScreen}
        options={{
          headerShown: false,
        }}
      />
    </NewstedStack.Navigator>
  );
};


/**
 * Function returning the homescreen navigation stack
 * @return {Fragment} Fragment to be displayed
 */
const HomeScreen = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [screenIndex, setScreenIndex] = useState(0);
  const navigation = useNavigation();
  const title = useTitle();

  /**
 * Function to toggle the visability of the dialog
 * @return {Void} 
 */
  const toggleDialog = () => {
    setShowDialog(!showDialog);
  };

  /**
 * Function that set the record-view visible
 * @return {Void} 
 */
  const navToRecord = () => {
    navigation.navigate("Record");
    toggleDialog();
  };

  return (
    <>
      <Header navBack={false} headerTitle={title.title}/>
      <InternetBar />
      <NavigationContainer independent>
        <StackNavigator />
      </NavigationContainer>
      <BottomNav
        onRecordButtonpress={toggleDialog}
        onNavButtonpress={setScreenIndex}
        setHeader={title.setTitle}
        screenIndex={screenIndex}
      />
      <Dialog
        visible={showDialog}
        cancleAction={toggleDialog}
        confirmAction={navToRecord}
        dialogText="Press the start-button to start a new follow-up trip"
        dialogTitle="New Follow-up trip"
        confirmText="start"
        transparent={true}
      />
    </>
  );
}

export default HomeScreen;