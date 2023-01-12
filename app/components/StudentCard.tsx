/* eslint-disable react-native/no-inline-styles */
import { observer } from "mobx-react-lite"
import React from "react"
import { View } from "react-native"
import { Student } from "../models/Student"
import { colors, spacing } from "../theme"
import { AutoImage } from "./AutoImage"
import { Card } from "./Card"
import { Text } from "./Text"

export interface StudentCardProps {
  student: Student
  additionalComponent?: React.ReactElement
  firstAdditionalInfo?: string
  secondAdditionalInfo?: string
  onPress?: () => void
  preset?: "default" | "selected"
}

export const StudentCard = observer(function StudentCard({
  student,
  additionalComponent,
  firstAdditionalInfo,
  secondAdditionalInfo,
  onPress,
  preset,
}: StudentCardProps) {
  const studentImg = require("../../assets/images/boy.jpeg")

  return (
    <Card
      style={{
        flex: 1,
        flexDirection: "row",
        borderRadius: 20,
        borderWidth: 0,
        alignItems: "center",
        padding: 0,
        height: 100,
        marginTop: spacing.small,
        backgroundColor: preset === "selected" ? colors.ehkamPeach : colors.background,
      }}
      verticalAlignment="center"
      onPress={onPress}
      LeftComponent={
        <AutoImage
          style={
            preset === "selected"
              ? {
                  alignSelf: "center",
                  borderRadius: 20,
                  width: 80,
                  height: 80,
                  marginStart: spacing.small,
                }
              : {
                  alignSelf: "center",
                  borderRadius: 20,
                  width: 100,
                  height: 100,
                }
          }
          source={studentImg}
        />
      }
      RightComponent={additionalComponent}
      HeadingComponent={
        <Text
          size="md"
          weight="bold"
          style={{ color: preset === "selected" ? colors.background : colors.ehkamDarkGrey }}
        >
          {student.fullname}
        </Text>
      }
      ContentComponent={
        firstAdditionalInfo &&
        secondAdditionalInfo && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: 130,
            }}
          >
            <Text
              weight="book"
              style={{ color: preset === "selected" ? colors.background : colors.ehkamGrey }}
            >
              {firstAdditionalInfo}
            </Text>
            <Text
              weight="book"
              style={{ color: preset === "selected" ? colors.background : colors.ehkamPeach }}
            >
              {secondAdditionalInfo}
            </Text>
          </View>
        )
      }
    />
  )
})
