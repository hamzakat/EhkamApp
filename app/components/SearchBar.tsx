/* eslint-disable react-native/no-inline-styles */
import React, { Ref } from "react"
import { ViewStyle, TextInput } from "react-native"
import { colors } from "../theme"
import { Icon } from "./Icon"

import { TextField } from "./TextField"

type SearchBarProps = {
  onBlur: (event: any) => void
  onChangeText: (text: string) => void
  onFocus: (event: any) => void
  style?: ViewStyle
}

export const SearchBar = React.forwardRef(function SearchBar(
  props: SearchBarProps,
  ref: Ref<TextInput>,
) {
  return (
    <TextField
      ref={ref}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      RightAccessory={() => {
        return <Icon icon="searchCyan" style={{ width: 18, top: 6, right: 12 }} />
      }}
      inputWrapperStyle={{
        borderColor: colors.ehkamPeach,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: colors.background,
      }}
      placeholder="اسم الطالب ..."
      LabelTextProps={{ weight: "book" }}
      placeholderTextColor={colors.ehkamGrey}
      onChangeText={(value) => props.onChangeText(value)}
      containerStyle={props.style}
    />
  )
})
