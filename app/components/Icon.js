import React from "react";
import { View } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import { appColors, appSizes } from "../config";

const Icon = ({
  iconSize = appSizes.iconSize,
  iconColor = appColors.secondary,
  iconName,
  MI = true,
  ...otherProps
}) => {
  if(MI){
    return (
      <View>
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} {...otherProps}/>
      </View>
    );
  }else{
    return (
      <View>
        <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} {...otherProps}/>
      </View>
    );
  }
}

export default Icon;
