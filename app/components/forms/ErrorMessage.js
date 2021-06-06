import React from "react";
import { StyleSheet } from "react-native";

import AppText from "../AppText";
import { appColors } from "../../config";

function ErrorMessage({ error, visible }) {
  if (!error || !visible) return null;

  return <AppText style={styles.err} text={error} />
}

const styles = StyleSheet.create({
  err: {
    color: appColors.error,
  },
});

export default ErrorMessage;
