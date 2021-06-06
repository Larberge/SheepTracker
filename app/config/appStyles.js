import { Platform } from "react-native";

export default {
  fontfamily: Platform.OS === "android" ? "Roboto" : "Avenir",
};
