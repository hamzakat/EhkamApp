/* eslint-disable react-native/no-inline-styles */
import { View } from "react-native"
import { Text } from "./Text"
import React from "react"
import { colors, spacing } from "../theme"

export interface VerseItemProps {
  verseText: string
  verseNumber: string
  onTouchEnd?: () => void
}

export const VerseItem = (props: VerseItemProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 12,
        marginBottom: spacing.small,

        paddingVertical: spacing.medium,
        alignItems: "center",
        backgroundColor: colors.background,

        shadowColor: colors.palette.neutral800,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 1,
      }}
      onTouchEnd={props.onTouchEnd}
    >
      <View
        style={{
          marginHorizontal: spacing.small,
          backgroundColor: colors.ehkamPeach,
          borderRadius: 25,
          width: 30,
          height: 30,
          justifyContent: "center",
          alignItems: "center",

          shadowOffset: {
            width: 0,
            height: 7,
          },
          shadowOpacity: 0.41,
          shadowRadius: 9.11,

          elevation: 4,
        }}
      >
        <Text
          text={props.verseNumber}
          size="xs"
          weight="medium"
          style={{ color: colors.background }}
        />
      </View>
      <View style={{ flex: 1, margin: spacing.small }}>
        <Text
          text={props.verseText}
          weight="semiBold"
          size="lg"
          style={{ color: colors.ehkamGrey }}
        />
      </View>
    </View>
  )
}
