// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"

export const customFontsToLoad = {
  expoArabicBook: require("../../assets/fonts/ExpoArabic-Book.ttf"),
  expoArabicMedium: require("../../assets/fonts/ExpoArabic-Medium.ttf"),
  expoArabicLight: require("../../assets/fonts/ExpoArabic-Light.ttf"),
  expoArabicSemiBold: require("../../assets/fonts/ExpoArabic-SemiBold.ttf"),
  expoArabicBold: require("../../assets/fonts/ExpoArabic-Bold.otf"),

  // Jannat fonts
  jannatRegular: require("../../assets/fonts/A.Jannat.LT.Regular_1.ttf"),
  jannatBold: require("../../assets/fonts/A.Jannat.LT.Bold_1.ttf"),
}

const fonts = {
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
  expoArabic: {
    book: "expoArabicBook",
    medium: "expoArabicMedium",
    light: "expoArabicLight",
    semiBold: "expoArabicSemiBold",
    bold: "expoArabicBold",
  },
  jannat: {
    regular: "jannatRegular",
    bold: "jannatBold",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.expoArabic,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
