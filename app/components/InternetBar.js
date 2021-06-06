import React from "react";
import { StyleSheet, View } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";

import { appColors } from "../config";
import AppText from "./AppText";

const InternetBar =() =>{
  const netInfo = useNetInfo();

  if (netInfo.type !== "unknown" && netInfo.isInternetReachable === false) {
    return (
      <>
        {!netInfo.isInternetReachable && (
          <View style={styles.container}>
            <AppText text="no internet access" style={styles.textStyle} />
          </View>
        )}
      </>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appColors.error,
    width: "100%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  textStyle: {
    color: appColors.secondaryLight,
    fontStyle: "italic",
  },
});

export default InternetBar;
