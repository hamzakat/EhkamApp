/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native"
import React, { FC } from "react"
import { View } from "react-native"
import { AutoImage, Button, Icon, Screen, Text } from "../components"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { useStores } from "../models"

interface EnterScreenProps extends AppStackScreenProps<"Enter"> {}

const headerImg = require("../../assets/images/welcome-header.png")
export const EnterScreen: FC<EnterScreenProps> = function EnterScreen(_props) {
  const navigation = useNavigation()
  const { currentUserStore } = useStores()
  return (
    <Screen preset="auto" safeAreaEdges={["top", "bottom"]}>
      <AutoImage
        source={headerImg}
        style={{
          alignSelf: "center",
          width: "100%",
          height: 400,
          paddingHorizontal: 0,
          paddingBottom: spacing.large,
          top: 1,
        }}
        resizeMethod="auto"
        resizeMode="cover"
      />

      <View
        style={{ justifyContent: "space-around", alignItems: "center", marginTop: spacing.medium }}
      >
        <Button
          preset="reversed"
          style={{
            marginTop: spacing.large,
            backgroundColor: colors.ehkamPeach,
            borderRadius: 20,
          }}
          textStyle={{ flexDirection: "row" }}
          onPress={() => {
            // enter the app
            currentUserStore.setProp("entered", true)
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.large }}
          >
            <Icon
              icon="leftStickArrow"
              size={spacing.medium}
              containerStyle={{ marginEnd: spacing.small }}
            />
            <Text weight="medium" text="ادخل إلى النظام" style={{ color: colors.background }} />
          </View>
        </Button>
      </View>
    </Screen>
  )
}
