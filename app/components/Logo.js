import React from 'react';
import {StyleSheet, View, Image} from 'react-native';

import { appColors } from "../config";


const Logo = ({style}) => {
   return (
    <View style={[styles.logo, style]}>
        <Image
            resizeMode="contain"
            source={require("../assets/sheep_128.png")}
        />
    </View>
   );
}

const styles =  StyleSheet.create({
    logo: {
        alignItems: "center",
        backgroundColor: appColors.secondaryLight,
        borderColor: appColors.gray300,
        borderWidth: 2,
        borderRadius: 70,
        elevation: 12,
        height: 140,
        justifyContent: "center",
        width: 140,
        shadowColor: "gray",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.5,
        zIndex: 1,
    },
});

export default Logo;