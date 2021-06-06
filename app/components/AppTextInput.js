import React, { useEffect, useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";

import Icon from "./Icon";
import { appColors, appSizes, appStyles } from "../config";

const AppTextInput = ({
  iconName,
  style,
  keyboardType = "default",
  valueFunc,
  maxLength,
  text,
  error,
  placeHolderText = "Comment",
  ...otherProps
}) => {
  const [inputValue, setInputValue] = useState();

  useEffect(()=>{
    setInputValue(text);
  },[])

  return (
    <View style={[styles.container, {borderColor: error ? "tomato" : appColors.primary}, style]}>
      {iconName && (
        <Icon
          iconName={iconName}
          iconSize={24}
          iconColor={appColors.gray200}
          style={styles.iconStyle}
        />
      )}
      <TextInput
        placeholder= {placeHolderText}
        type="outlined"
        style={styles.textInput}
        selectionColor={appColors.primary}
        textAlign={"center"}
        keyboardType={keyboardType}
        value={inputValue}
        onChange={({ nativeEvent }) => {setInputValue(nativeEvent.text); if(valueFunc) valueFunc(nativeEvent.text)}}
        returnKeyType="done"
        {...otherProps}
      ></TextInput>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: appSizes.borderSize,
    borderRadius: appSizes.themeRadius,
    borderColor: appColors.primary,
    height: appSizes.standardComponentSize,
    justifyContent: "center"
    
  },
  iconStyle: {
    position: "absolute",
  },
  textInput: {
    color: appColors.gray900,
    fontSize: 18,
    fontFamily: appStyles.fontFamily,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
});

export default AppTextInput;
