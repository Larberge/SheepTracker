import React from "react";
import { Modal, StyleSheet, View } from "react-native";

import { appColors, appSizes } from "../config";
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";

const Dialog = ({
  confirmText,
  cancleText,
  dialogTitle,
  dialogText,
  cancleAction,
  confirmAction,
  visible,
  animationType,
  transparent,
  childComponent
}) => {
  return (
    <Modal
      visible={visible}
      animationType={animationType ? animationType : "fade"}
      transparent={transparent}
    >
      <View style={styles.dialogContainer}>
        <View style={styles.dialog}>
          <AppText text={dialogTitle} style={styles.dialogTitle} />
          <AppText style={styles.dialogText} text={dialogText} />
          {childComponent}
          <View style={styles.dialogButtonContainer}>
            <AppButton
              buttonStyle={styles.dialogButtonCancle}
              buttonText={cancleText ? cancleText : "cancle"}
              textSize={24}
              textColor={appColors.gray600}
              onPress={cancleAction}
            />
            <AppButton
              buttonStyle={styles.dialogButtonStart}
              buttonText={confirmText ? confirmText : "OK"}
              textColor={appColors.secondaryLight}
              textSize={24}
              onPress={confirmAction}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dialogButtonCancle: {
    backgroundColor: appColors.secondaryLight,
    borderColor: appColors.gray600,
  },
  dialogButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dialogContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appColors.secondaryTransparent,
  },
  dialog: {
    justifyContent: "space-between",
    width: "80%",
    minHeight: "50%",
    backgroundColor: appColors.secondaryLight,
    borderColor: appColors.primary,
    borderRadius: appSizes.themeRadius,
    padding: 16,
    borderWidth: 2,
    elevation: 16,
    shadowColor: appColors.gray300,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  dialogText: {
    fontSize: 24,
    color: appColors.gray700,
  },
  dialogTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: 28,
    color: appColors.gray900,
  },
});

export default Dialog;
