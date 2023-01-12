/* eslint-disable react-native/no-inline-styles */
import { View, ViewStyle } from "react-native"
import React from "react"
import { colors, spacing } from "../theme"
import { Text } from "./Text"

export const BorderedText = ({
  text,
  disabled,
  style,
}: {
  text: string
  disabled: boolean
  style?: ViewStyle
}) => {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: disabled ? colors.ehkamGrey : colors.ehkamPeach,
        borderRadius: spacing.small,
        padding: spacing.extraSmall,
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <Text weight="medium" size="xs" style={{ color: colors.ehkamGrey }} text={text} />
    </View>
  )
}
