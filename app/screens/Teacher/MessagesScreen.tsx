import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../../navigators"
import { Screen, Text } from "../../components"
import { colors, spacing } from "../../theme"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Messages: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Messages" component={MessagesScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const MessagesScreen: FC<StackScreenProps<AppStackScreenProps, "Messages">> = observer(
  function MessagesScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()
    return (
      <Screen
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        safeAreaEdges={["top", "left"]}
        preset="scroll"
      >
        <Text
          style={{ textAlign: "center", color: colors.ehkamPeach, paddingVertical: spacing.small }}
          text="💬  قريباً..."
          weight="medium"
          size="xxl"
        />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}
