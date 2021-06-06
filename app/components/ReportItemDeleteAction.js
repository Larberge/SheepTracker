import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";


import { appColors } from "../config";
import reportAPI from "../api/reports";
import AppButton from "./AppButton";

const ReportItemDeleteAction = ({ item }) => {
  const netInfo = useNetInfo();
  const deleteReport = useApi(reportAPI.deleteReport);

  const removeReport = () => {
    if(netInfo.type != "unknown" && netInfo.isInternetReachable === false){
      Alert.alert(
        "No Internet Access",
        "You need internet access to delete reports properly",
        [
          {
            text: "Ok",
            style: "destructive",
          },
        ],
        { cancelable: false }
      )
    }else{
      Alert.alert(
        "Delete report",
        "Are you sure you want to delete this report?",
        [
          {
            text: "Cancel",
            style: "destructive",
          },
          {
            text: "Yes",
            onPress: () => {
              deleteReport.request(item.externalID);
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppButton
        iconColor={appColors.gray700}
        iconName="delete"
        buttonStyle={styles.button}
        onPress={() => removeReport()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: appColors.transparent,
    borderColor: appColors.transparent,
  },
  container: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReportItemDeleteAction;
