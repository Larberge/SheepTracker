import React from "react";
import { useFormikContext } from "formik";

import AppButton from "../AppButton";

function SubmitButton({ style, title, ...otherProps }) {
  const { handleSubmit } = useFormikContext();
  return (
    <AppButton buttonText={title} onPress={handleSubmit} {...otherProps} />
  );
}

export default SubmitButton;
