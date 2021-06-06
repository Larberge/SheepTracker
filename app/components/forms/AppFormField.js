import React from "react";
import { useFormikContext } from "formik";

import AppTextInput from "../AppTextInput";
import ErrorMessage from "./ErrorMessage";
import { View } from "react-native";

function AppFormField({ fieldName, ...otherProps }) {
  const {
    setFieldTouched,
    setFieldValue,
    errors,
    touched,
    values,
  } = useFormikContext();

  return (
    <View style = {{marginBottom: 8}}>
      <AppTextInput
        onBlur={() => setFieldTouched(fieldName)}
        onChangeText={(text) => setFieldValue(fieldName, text)}
        value={values[fieldName]}
        autoCapitalize="none"
        autoCorrect={false}
        {...otherProps}
      />
      <ErrorMessage error={errors[fieldName]} visible={touched[fieldName]} />
    </View>
  );
}

export default AppFormField;