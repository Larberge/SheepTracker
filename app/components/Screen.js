import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import Constants from "expo-constants";

import { appColors } from "../config";

const Screen = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: appColors.secondary,
  },
});

export default Screen;
