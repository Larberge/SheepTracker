import React, {useState} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { appColors, appSizes } from "../config";
import Icon from "./Icon";
import AppText from "./AppText";
import { ScrollView } from "react-native-gesture-handler";

const Dropdown = ({
    labelText,
    defaultValue,
    options,
    onOptionPress,
}) => {

const [optionsVisible, setOptionVisible] = useState(false);
const [selectedValue, setSelectedValue] = useState(defaultValue ? null : options[0]);

const toggleOptionsVisible = () => {
    setOptionVisible(!optionsVisible);
}

const optionPress = (opt) => {
    setSelectedValue(opt);
    toggleOptionsVisible();
    if(onOptionPress){
        onOptionPress(opt)
    }
}

const renderOptions = () => {
    if(options.length > 0){
        return options.map( option => (
            <TouchableOpacity key={option} style={styles.optionElement} onPress={() => {optionPress(option)}}>
                <AppText text={option}/>
            </TouchableOpacity>
        ));
    }
}

return (
    <View style={styles.main}>
        <View style={{alignItems: "flex-start"}}>
            <AppText text={labelText} style={{color: appColors.gray700}}/>
        </View>
        <TouchableOpacity style={styles.dropdown} onPress={() => toggleOptionsVisible()}> 
            <AppText text={defaultValue && !selectedValue ? defaultValue : selectedValue} style={{fontSize: 20, color: appColors.secondaryLight}}/>
            <Icon iconName={optionsVisible ? "arrow-drop-up" : "arrow-drop-down"}/>
        </TouchableOpacity>
        {optionsVisible &&
            <ScrollView style={styles.options}>
                {renderOptions()}
            </ScrollView>
        }
    </View>
);
}

const styles = StyleSheet.create({
    main: {
        borderColor: appColors.secondary,
        borderWidth: 2,
        borderRadius: appSizes.themeRadius,
        overflow: "hidden",
    },
    dropdown:{
        alignItems: "center",
        backgroundColor: appColors.primaryDark,
        borderTopLeftRadius: appSizes.themeRadius,
        borderTopRightRadius: appSizes.themeRadius,
        flexDirection: "row",
        height: 50,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        width: "100%",
    },
    options:{
        width: "100%",
        maxHeight: 150,
    },
    optionElement: {
        justifyContent: "center",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        width: "100%",
        minHeight: 40,
        borderTopColor: appColors.gray500,
        borderTopWidth: 2,
        backgroundColor: appColors.gray300, 
    }
});

export default Dropdown;
