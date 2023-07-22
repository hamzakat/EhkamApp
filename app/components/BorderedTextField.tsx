/* eslint-disable react-native/no-inline-styles */
import React from "react"
import { KeyboardTypeOptions, TextStyle, ViewStyle } from "react-native"
import { TextField } from "./TextField"
import { colors } from "../theme/colors"
import { spacing } from "../theme"

export const BorderedTextField = ({
  value,
  onChangeText,
  containerStyle,
  inputWrapperStyle,
  textStyle,
  editable,
  keyboardType,
}: {
  value: string
  onChangeText: (value) => void
  containerStyle?: ViewStyle
  inputWrapperStyle?: ViewStyle
  textStyle?: TextStyle
  editable: boolean
  keyboardType: KeyboardTypeOptions
}) => {
  return (
    <TextField
      selectionColor={colors.ehkamDarkGrey}
      style={{
        color: colors.ehkamCyan,
        textAlign: "center",
        fontSize: 16,
        fontFamily: "expoArabicSemiBold",
        ...textStyle,
      }}
      containerStyle={{ flex: 0.4, ...containerStyle }}
      inputWrapperStyle={{
        borderWidth: 1,
        borderRadius: spacing.small,
        backgroundColor: colors.background,
        paddingVertical: 0,
        height: 39,
        ...inputWrapperStyle,
      }}
      editable={editable}
      textAlignVertical="center"
      textAlign="center"
      onChangeText={onChangeText}
      value={value}
      keyboardType={keyboardType}
    />
  )
}
