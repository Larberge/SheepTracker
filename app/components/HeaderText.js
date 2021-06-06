import React from "react";
import { StyleSheet } from "react-native";

import { appColors } from "../config";
import AppText from "./AppText";

const HeaderText = ({ headerText }) => {
  return <AppText style={styles.text} text={headerText} />;
}

const styles = StyleSheet.create({
  text: {
    color: appColors.secondaryLight,
    fontSize: 30,
    fontWeight: "500",
    paddingLeft: 16,
    textAlign: "center",
  },
});

export default HeaderText;
