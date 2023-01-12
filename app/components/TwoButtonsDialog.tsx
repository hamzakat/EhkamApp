/* eslint-disable react-native/no-inline-styles */
import { View } from "react-native"
import React from "react"
import { Dialog } from "react-native-simple-dialogs"
import { colors, spacing } from "../theme"
import { Icon } from "./Icon"
import { Button } from "./Button"
import { Text } from "./Text"

interface TwoButtonsDialogProps {
  visible: boolean
  cyanButtonFn: () => void
  peachButtonFn: () => void
  cancel: () => void
  text: string
  cyanButtonText?: string
  peachButtonText?: string
}

export const TwoButtonsDialog = (props: TwoButtonsDialogProps) => {
  return (
    <View>
      <Dialog
        visible={props.visible}
        onTouchOutside={props.peachButtonFn}
        dialogStyle={{
          backgroundColor: colors.background,
          borderRadius: spacing.small,
        }}
      >
        <View>
          <Icon
            icon="x"
            style={{ position: "absolute", top: -12, right: -12, alignSelf: "flex-end" }}
            color={colors.ehkamDarkGrey}
            onPress={props.cancel}
          />

          <Text
            weight="medium"
            text={props.text}
            style={{ color: colors.ehkamDarkGrey, textAlign: "center", marginTop: spacing.medium }}
            size="md"
          />
          <View
            style={{
              flexDirection: "row",
              marginTop: spacing.medium,
              justifyContent: "space-around",
            }}
          >
            <Button
              text={props.cyanButtonText ? props.cyanButtonText : "نعم"}
              textStyle={{ color: colors.background }}
              style={{
                borderWidth: 0,
                borderRadius: spacing.small,
                width: 75,
                backgroundColor: colors.ehkamCyan,
              }}
              onPress={props.cyanButtonFn}
            />
            <Button
              text={props.peachButtonText ? props.peachButtonText : "لا"}
              textStyle={{ color: colors.background }}
              style={{
                borderWidth: 0,
                borderRadius: spacing.small,
                width: 75,
                backgroundColor: colors.ehkamPeach,
              }}
              onPress={props.peachButtonFn}
            />
          </View>
        </View>
      </Dialog>
    </View>
  )
}
