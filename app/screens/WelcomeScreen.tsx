/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native"
import React, { FC } from "react"
import { View } from "react-native"
import { AutoImage, Button, Icon, Screen, Text } from "../components"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

const headerImg = require("../../assets/images/login-header.jpg")
export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen(_props) {
  const navigation = useNavigation()

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

      <View style={{ justifyContent: "space-around", alignItems: "center" }}>
        <View style={{ marginVertical: spacing.large }}>
          <Text
            preset="subheading"
            text="أهلاً بك في نظام إحكام"
            style={{ color: colors.ehkamDarkGrey }}
          />
          <Text
            preset="subheading"
            text="لإدارة حلقات القرآن رقمياً"
            style={{ color: colors.ehkamDarkGrey, marginTop: spacing.small }}
          />
        </View>

        <Button
          preset="reversed"
          style={{
            marginTop: spacing.large,
            backgroundColor: colors.ehkamPeach,
            borderRadius: 20,
          }}
          textStyle={{ flexDirection: "row" }}
          onPress={() => {
            // got to login screen
            navigation.navigate("Login")
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
            <Text
              weight="medium"
              text="متابعة إلى تطبيق المعلم"
              style={{ color: colors.background }}
            />
          </View>
        </Button>
      </View>
    </Screen>
  )
}
