/* eslint-disable react-native/no-inline-styles */
import ModalSelector from "react-native-modal-selector"
import { View, ViewStyle } from "react-native"
import React from "react"
import { colors, spacing } from "../theme"
import { Text } from "./Text"

export const ModalSelect = function ({
  options,
  onChange,
  placeholder,
  selectedOpt,
  selectedKey,
  containerStyle,
  disabled,
}: {
  options: any
  onChange?: any
  placeholder?: string
  selectedOpt: any
  selectedKey: number
  containerStyle?: ViewStyle
  disabled?: boolean
}) {
  return (
    <View style={containerStyle}>
      <ModalSelector
        data={options}
        onChange={(option) => onChange({ label: option.label, key: option.key })}
        disabled={disabled}
        selectedKey={selectedKey}
        cancelText="رجوع"
        cancelTextStyle={{
          fontSize: 14,
          fontFamily: "expoArabicMedium",
          color: colors.ehkamPeach,
        }}
        optionTextStyle={{
          fontSize: 16,
          fontFamily: "expoArabicMedium",
          color: colors.ehkamDarkGrey,
        }}
        selectedItemTextStyle={{
          fontSize: 16,
          fontFamily: "expoArabicSemiBold",
          color: colors.ehkamCyan,
        }}
        // eslint-disable-next-line react-native/no-color-literals
        overlayStyle={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: disabled ? colors.ehkamGrey : colors.ehkamPeach,
            borderRadius: spacing.small,
            padding: spacing.extraSmall,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            weight="book"
            size="xs"
            style={{ color: colors.ehkamGrey, marginStart: placeholder ? spacing.extraSmall : 0 }}
            text={placeholder}
          />
          <Text
            weight="bold"
            size="xs"
            style={{
              color: disabled ? colors.ehkamGrey : colors.ehkamCyan,
              marginHorizontal: spacing.extraSmall,
            }}
            text={selectedOpt}
          />
        </View>
      </ModalSelector>
    </View>
  )
}
