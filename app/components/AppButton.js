import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import AppText from "./AppText";
import { appColors, appSizes } from "../config";
import Icon from "./Icon";

const AppButton = ({
  buttonStyle,
  buttonText,
  fontWeight,
  iconColor,
  iconName,
  iconSize,
  onPress,
  textSize,
  textColor,
  disabled,
  iconSideLeft = true,
}) => {
  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress} disabled={disabled ? disabled : false}>
      {iconName && iconSideLeft &&(
        <Icon iconColor={iconColor} iconName={iconName} iconSize={iconSize}/>
      )}
      {buttonText && (
        <AppText
          style={{
            fontSize: textSize,
            color: textColor ? textColor : appColors.secondaryLight,
            fontWeight: fontWeight ? fontWeight : "700",
          }}
          text={buttonText.toUpperCase()}
        />
      )}
      {iconName && !iconSideLeft &&(
        <Icon iconColor={iconColor} iconName={iconName} iconSize={iconSize}/>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: appSizes.themeRadius,
    borderColor: appColors.primaryDark,
    borderWidth: appSizes.borderSize,
    backgroundColor: appColors.primary,
    elevation: 2,
    flexDirection: "row",
    height: appSizes.standardComponentSize,
    justifyContent: "center",
    shadowColor: appColors.gray800,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 0.5,
    paddingHorizontal: 8,
  },
});

export default AppButton;
