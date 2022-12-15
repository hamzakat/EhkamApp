import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Text } from "../../components"
import { isRTL } from "../../i18n"
import { useStores } from "../../models" // @demo remove-current-line
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"
import { colors, spacing } from "../../theme"
import { useHeader } from "../../utils/useHeader" // @demo remove-current-line
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"

const welcomeLogo = require("../../../assets/images/logo.png")
const welcomeFace = require("../../../assets/images/welcome-face.png")

interface HomeScreenProps extends TeacherTabScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function WelcomeScreen(_props) {
  // const { navigation } = _props
  const { authenticationStore, currentUserStore } = useStores()

  console.log(currentUserStore.user.first_name)

  useHeader({
    rightTx: "common.logOut",
    onRightPress: authenticationStore.logOut,
  })

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  return (
    <View style={$container}>
      <View style={$topContainer}>
        <Text testID="welcome-heading" style={$welcomeHeading} text="الترويسة" preset="heading" />
        <Text text="مرحباً" preset="subheading" />
        <Image style={$welcomeFace} source={welcomeFace} resizeMode="contain" />
      </View>

      <View style={[$bottomContainer, $bottomContainerInsets]}>
        <Button
          testID="next-screen-button"
          preset="reversed"
          text="Let's go"
          onPress={async function () {
            await currentUserStore.fetchCurrentUser()
          }}
        />
      </View>
    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.large,
}

const $bottomContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.large,
  justifyContent: "space-around",
}
const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.huge,
}

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: TextStyle = {
  marginBottom: spacing.medium,
}
