import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  slideContainer: {
    ...commonStyles.flexContainer,
    flex: 1, // Ensure the container takes the full height of the screen
  },
  imageBackground: {
    width: "100%",
    height: "100%", // Make the image fill the entire available height
    resizeMode: "cover", // Ensure the image covers the full area without distortion
  },
  title: {
    ...commonStyles.mediumText23,
    marginTop: windowHeight(25),
    ...external.ti_center,
  },
  description: {
    ...commonStyles.regularText,
    paddingTop: windowHeight(12),
    width: "75%",
    ...external.as_center,
    fontSize: fontSizes.FONT19,
    lineHeight: windowHeight(17),
    ...external.ti_center,
  },
  backArrow: {
    width: windowHeight(34),
    height: windowHeight(34),
    borderRadius: windowHeight(34),
    backgroundColor: color.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    bottom: 0,
    position: "absolute",
  },
  img: {
    width: "100%",
    height: windowHeight(180),
    marginBottom: windowHeight(45),
  },
  activeStyle: {
    width: "7%",
    backgroundColor: color.buttonBg,
  },
  paginationStyle: {
    height: "25%",
  },
  imageBgView: {
    flex: 1, // Ensure the view takes the full height
    justifyContent: "flex-end", // Align content at the bottom
  },
  flagImage: {
    height: windowHeight(20),
    width: windowWidth(30),
    borderRadius: 15,
  },
  downArrow: {
    paddingVertical: windowHeight(4),
    paddingHorizontal: windowWidth(5),
  },
  dropdownManu: {
    borderRadius: 5,
    borderWidth: 0,
  },
  dropdownContainer: {
    width: windowWidth(180),
    borderWidth: 0,
    color: color.alertRed,
  },
  labelStyle: {
    fontFamily: fonts.medium,
  },
  dropdown: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  skipText: {
    color: color.regularText,
    paddingVertical: windowHeight(4),
    fontFamily: fonts.regular,
  },
});

export { styles };
