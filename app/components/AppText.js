import React from "react";
import {Text, StyleSheet } from "react-native";

import { appStyles } from "../config";

/**
 * Component for showing text.
 * @component 
 */

const Apptext = ({ numberOfLines, style, text, ...otherprops }) => {
  if (text)
    return (
      <Text
        numberOfLines={numberOfLines}
        style={[styles.text, style]}
        {...otherprops}
      >
        {text}
      </Text>
    );
  return <Text style={[styles.text, style]}>-</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: appStyles.fontfamily,
    fontSize: 16,
    textAlign: "center",
  },
});

export default Apptext;

