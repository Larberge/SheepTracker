import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppButton from "./AppButton";
import { appColors, appSizes } from "../config";

const BottomNav = ({ onRecordButtonpress, setHeader, onNavButtonpress, screenIndex }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <AppButton
          buttonStyle={styles.iconButton}
          iconName="home"
          iconColor={appColors.gray500}
          iconSize={32}
          onPress={() => {
            onNavButtonpress(0);
            setHeader("SheepTracker")
            navigation.navigate("Main", { screen: "Home" });
          }}
        />
        <View
          style={{
            width: "100%",
            height: 5,
            backgroundColor:
              screenIndex == 0 ? appColors.primary : appColors.transparent,
          }}
        ></View>
      </View>
      <AppButton
        buttonStyle={styles.recordButton}
        iconName="add"
        iconsize={32}
        onPress={onRecordButtonpress}
      />
      <View style={styles.buttonContainer}>
        <AppButton
          buttonStyle={styles.iconButton}
          iconName="person"
          iconColor={appColors.gray500}
          iconSize={32}
          onPress={() => {
            onNavButtonpress(1);
            setHeader("Account");
            navigation.navigate("Main", { screen: "Profil" });
          }}
        />
        <View
          style={{
            width: "100%",
            height: 5,
            backgroundColor:
              screenIndex == 1 ? appColors.primary : appColors.transparent,
          }}
        ></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    backgroundColor: appColors.secondaryLight,
    borderTopWidth: 1,
    borderTopColor: appColors.secondaryDark,
    elevation: 5,
    flexDirection: "row",
    height: appSizes.standardComponentSize,
    justifyContent: "space-around",
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderTopWidth: Platform.OS === "android" ? 2 : 0,
    borderTopColor: "#DEDEDC",
    elevation: 24,
  },
  iconButton: {
    backgroundColor: appColors.transparent,
    borderColor: appColors.transparent,
    elevation: 0,
  },
  recordButton: {
    bottom: 12,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

export default BottomNav;
