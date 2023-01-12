/* eslint-disable react-native/no-inline-styles */
import { View } from "react-native"
import React, { useEffect, useState } from "react"
import { Dialog } from "react-native-simple-dialogs"
import { colors, spacing } from "../theme"
import { Icon } from "./Icon"
import { Button } from "./Button"
import { Text } from "./Text"

interface WarningDialogProps {
  visible: boolean
  cancel: () => void
  preset: "peach" | "cyan" | "white"
  text: string
  buttonText: string
}

export const WarningDialog = (props: WarningDialogProps) => {
  const [bgColor, setBgColor] = useState("")
  const [fontColor, setFontColor] = useState("")
  const [btnColor, setBtnColor] = useState("")

  useEffect(() => {
    const bgColor =
      props.preset === "peach"
        ? colors.ehkamPeach
        : props.preset === "cyan"
        ? colors.ehkamCyan
        : colors.background

    const fontColor =
      props.preset === "peach" || props.preset === "cyan" ? colors.background : colors.ehkamDarkGrey

    const btnColor =
      props.preset === "peach" || props.preset === "cyan" ? colors.background : colors.ehkamPeach

    setBgColor(bgColor)
    setFontColor(fontColor)
    setBtnColor(btnColor)
  }, [])

  return (
    <View>
      <Dialog
        visible={props.visible}
        onTouchOutside={props.cancel}
        dialogStyle={{
          backgroundColor: bgColor,
          borderRadius: spacing.small,
        }}
      >
        <View>
          <Icon
            icon="x"
            style={{ position: "absolute", top: -12, right: -12, alignSelf: "flex-end" }}
            color={colors.background}
            onPress={props.cancel}
          />

          <Text
            weight="medium"
            text={props.text}
            style={{ color: fontColor, textAlign: "center", marginTop: spacing.medium }}
            size="sm"
          />
          <Button
            text={props.buttonText}
            textStyle={{ color: bgColor }}
            style={{
              borderWidth: 0,
              borderRadius: spacing.small,
              backgroundColor: btnColor,
              width: 75,
              marginTop: spacing.medium,
              alignSelf: "center",
            }}
            onPress={props.cancel}
          />
        </View>
      </Dialog>
    </View>
  )
}
