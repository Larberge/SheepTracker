import React, {useState }from "react";
import { StyleSheet, View } from "react-native";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import * as Crypto from 'expo-crypto';

import { appColors } from "../config";
import { AppForm, AppFormField, ErrorMessage, SubmitButton } from "../components/forms";
import Screen from "../components/Screen";
import useApi from "../hooks/useApi";
import Logo from "../components/Logo";
import AppButton from "../components/AppButton";
import authApi from "../api/auth";
import usersApi from "../api/users";
import AppActivityIndicator from "../components/AppActivityIndicator";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required().min(1).label("Firstname"),
  lastName: Yup.string().required().min(1).label("Lastname"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});


/**
 * Function that renders the registration screen
 * @Component
 * @returns {Screen} The screen component to be rendered
 */
const RegistrationScreen = () => {
  const [error, setError] = useState();
  const navigation = useNavigation();
  const registerApi = useApi(usersApi.register);
  const loginApi = useApi(authApi.login);
  const auth = useAuth()
  

/**
 * Function handles the submit of a new account
 * @returns {Void}
 */
  const handleSubmit = async (registrationInfo) => {
    let digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, registrationInfo.password);
    registrationInfo.password = digest;
    const result = await registerApi.request(registrationInfo);
    if (!result.ok || !result.data.valid) {
      registrationInfo.password = ""
      if(result.data) setError(result.data.error);
      else {
        setError("An unexpected error occurred.");
      }
      return;
    }
    registrationInfo.password = ""
    const { data: authToken } = await loginApi.request(
      registrationInfo.email,
      digest
    );
    auth.logIn(authToken);
  }
  
  return (
    <Screen>
      <AppButton 
        buttonStyle={styles.navBackButton} 
        iconName = "arrow-back" 
        iconColor={appColors.gray700}
        onPress={() => navigation.navigate("Login")}
      />
      <View style={{flex: 1, margin: 16, justifyContent: "center", alignItems: "center"}}>
        <Logo style={{margin: 16}}/>
        <AppForm 
          initialValues={{ firstName: "", lastName: "", email: "", password: ""}}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        > 
          <ErrorMessage error={error} visible={error} />
          <AppFormField
            fieldName="firstName"
            iconName="person"
            placeholder="First name"
          />
          <AppFormField
            fieldName="lastName"
            iconName="person"
            placeholder="Last name"
          />
          <AppFormField
            fieldName="email"
            iconName="email"
            keyboradType="email-address"
            placeholder="E-mail"
            textcontentType="emailAddress"
          />
          <AppFormField
            fieldName="password"
            iconName="lock"
            placeholder="Password"
            textContentType="password"
            secureTextEntry
          />
          <SubmitButton
            textColor={appColors.gray800}
            textSize={20}
            title="Registrer"
          />
          <AppActivityIndicator visible={registerApi.loading || loginApi.loading} />
        </AppForm>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  navBackButton: {
    backgroundColor: appColors.secondary,
    borderColor: appColors.secondary,
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    position: "absolute",
    left: 8,
    top: 16,
    zIndex: 5
  }
});

export default RegistrationScreen;