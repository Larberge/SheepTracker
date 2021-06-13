import React from "react";
import { Image, StyleSheet, View } from "react-native";
import useAuth from "../auth/useAuth";
import AppButton from "../components/AppButton";
import Apptext from "../components/AppText";

import { appColors } from "../config";

/**
* Component for displaying details of the user.
* @return View The view containing the content of the account screen
*/
const AccountScreen = () => {
  const {user, logOut} = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          resizeMode="contain"
          source={require("../assets/sheep_128.png")}
        />
      </View>
      <Apptext text={user.name} style={styles.nameText}/>
      <Apptext text={user.email} style={styles.emailText}/>
      <AppButton buttonText="Sign out" onPress={() => logOut()}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    backgroundColor: appColors.secondaryLight,
    borderColor: appColors.gray300,
    borderWidth: 2,
    borderRadius: 70,
    elevation: 12,
    height: 140,
    justifyContent: "center",
    marginBottom: 32,
    width: 140,
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    zIndex: 1,
  },
  nameText: {
    fontSize: 32, 
    color: appColors.gray700, 
    fontWeight: "bold"
  },
  emailText: {
    fontSize: 24, 
    color: appColors.gray700, 
    marginBottom: 32
  }
});

export default AccountScreen;
