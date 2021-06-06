import React from "react";
import { Image, View, StyleSheet } from "react-native";
import Constants from "expo-constants";

import { appColors, appSizes } from "../config";
import HeaderText from "./HeaderText";
import HeaderSubText from "./HeaderSubText";
import AppButton from "./AppButton";
import useAuth from "../auth/useAuth";


const Header = ({ headerTitle, subTitle, navBack = true, onNavBack }) => {
  const {user} = useAuth();

  return (
    <View style={styles.headerContainer}>
      {navBack && (
        <AppButton
          iconName="arrow-back"
          buttonStyle={styles.navBackButton}
          onPress={onNavBack}
        />
      )}
      <View style={styles.headerTextContainer}>
        <HeaderText headerText={headerTitle} />
        {headerTitle == "SheepTracker" && <HeaderSubText headerSubText={"Logged in as: "+user.name}/>}
      </View>
      <Image
        resizeMode="contain"
        source={require("../assets/sheep_96.png")}
        style={styles.appIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  appIcon: {
    height: "100%",
    right: -8,
  },
  headerContainer: {
    alignItems: "center",
    backgroundColor: appColors.primary,
    elevation: 2,
    flexDirection: "row",
    height: appSizes.standardComponentSize + Constants.statusBarHeight,
    justifyContent: "space-between",
    paddingTop: Constants.statusBarHeight,
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    zIndex: 1,
  },
  headerTextContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  navBackButton: {
    backgroundColor: appColors.transparent,
    borderColor: appColors.transparent,
    elevation: 0
  },
});

export default Header;
