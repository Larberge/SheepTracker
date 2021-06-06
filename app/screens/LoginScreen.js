import React, {useState }from "react";
import { StyleSheet, View } from "react-native";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import AuthAPI from "../api/auth";
import { appColors } from "../config";
import AppText from "../components/AppText"
import { AppForm, AppFormField, ErrorMessage, SubmitButton } from "../components/forms";
import Logo from "../components/Logo"
import Screen from "../components/Screen";
import useAuth from "../auth/useAuth";
import AppButton from "../components/AppButton";
import AppActivityIndicator from "../components/AppActivityIndicator";
import settings from "../config/settings"

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
});

/**
 * Function that returns the login screen
 * @return Screen Returns a screen component displaying the content of the login screen
 */

const LoginScreen = () => {
  const {logIn} = useAuth();
  const getPin = useApi(AuthAPI.getPin);
  const loginApi = useApi(AuthAPI.login);
  const navigation = useNavigation();
  const [loginFailed, setLoginFailed] = useState(false)
  const [pinStatus, setPinStatus] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");


/**
 * Function that handles the login submit interaction
 * @param   {Integer} pin Set of integers the user is to be authenticated with
 * @return  {Void} 
 */
  const handleSubmit = async ({pin}) => {
    const result = await loginApi.request(enteredEmail, pin);
    if(result.data){
      logIn(result.data);
    }else{
      setLoginFailed(true);
    }
  }


/**
 * Function that handles request pin interaction
 * @param   {String} email Email the user enters to recieve pin
 * @return  {Void} 
 */
  const handleRequestPin = async ({email}) => {
    setPinStatus(true);
    setEnteredEmail(email);
    await getPin.request(email);
  }


/**
 * Function that handles the registration of a new useracconut
 * @return  {Void} 
 */
  const registrateNewUserAsync = async () => {
    let result = await WebBrowser.openBrowserAsync(settings.registrationUrl);
    setResult(result);
  };


  return (
    <Screen>
      <View style={styles.view}>
        <Logo />
        {!pinStatus && <AppText text={"SheepTracker"} style={styles.title}/>}
        {pinStatus && <AppText text={"Check your email"} style={styles.title}/>}
        {pinStatus && <AppText text={"We sent a PIN to the email you entered"}/>}
        {!pinStatus && <AppForm
          initialValues={{ email: ""}}
          onSubmit={handleRequestPin}
          validationSchema={validationSchema}
        >
          <AppFormField
            fieldName="email"
            iconName="email"
            keyboradType="email-address"
            placeholder="E-mail"
            textcontentType="emailAddress"
          />
          <SubmitButton
            title="Send me a pin" 
            textColor={appColors.secondaryLight}
            textSize={20}
          />
        </AppForm>}
        {pinStatus && <AppForm
          initialValues={{pin: "" }}
          onSubmit={handleSubmit}
        >
          <ErrorMessage error="Invalig email and/or pin" visible={loginFailed}/>
          <AppFormField
            fieldName="pin"
            iconName="lock"
            placeholder="Pin"
            textContentType="none"
          />
          <SubmitButton
            textColor={appColors.secondaryLight}
            textSize={20}
            title="Login"
          />
          <AppActivityIndicator visible={loginApi.loading} />
        </AppForm>}
        <View style={{flex: 0.5,justifyContent: "flex-end"}} >
          {!pinStatus && <AppButton 
            buttonText="Or create an new account" 
            buttonStyle={styles.registrerButton}
            textColor={appColors.primaryLight}
            onPress={registrateNewUserAsync}
          />}
          {pinStatus &&<AppButton 
            buttonText="Did not get an email? Try again" 
            buttonStyle={styles.registrerButton}
            textColor={appColors.primaryLight}
            onPress={() => {
              setLoginFailed(false);
              setEnteredEmail("");
              setPinStatus(false);
              }
            }
          />}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  registrerButton: {
    backgroundColor: appColors.transparent,
    borderColor: appColors.transparent,
    height: 40,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  pinButton: {
    backgroundColor: appColors.primary,
    height: 50,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  title: {
    fontSize: 32, 
    color: appColors.gray700, 
    fontWeight: "bold", 
    fontStyle: "italic",
    marginBottom: 32,
    marginTop: 16
  },
  view: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});

export default LoginScreen;
