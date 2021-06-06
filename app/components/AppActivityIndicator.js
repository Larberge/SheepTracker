import React from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

import { appColors } from "../config";

const AppActivityIndicator = ({ visible = false,  ...otherprops}) => {
  if (!visible) return null;
  return (
    <View style={styles.loaderView}
    {...otherprops}>
      <LottieView
        autoPlay
        loop
        source={require("../assets/animations/lf30_editor_d9szvvh3.json")}
        style={{ zIndex: 5 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loaderView: {
    flex: 1,
    backgroundColor: appColors.secondaryTransparent,
    zIndex: 5,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});

export default AppActivityIndicator;
