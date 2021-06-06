import React from "react";
import { StyleSheet } from "react-native";

import { appColors } from "../config";
import AppText from "./AppText";

const HeaderSubText = ({ headerSubText }) => {
  return <AppText style={styles.text} text={headerSubText} />;
}

const styles = StyleSheet.create({
  text: {
    marginTop: -6,
    color: appColors.secondaryLight,
    fontSize: 14,
    fontWeight: "300",
    paddingLeft: 16,
  },
});

export default HeaderSubText;