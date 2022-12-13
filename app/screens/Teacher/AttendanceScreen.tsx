import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Attendance: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Attendance" component={AttendanceScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
interface AttendanceScreenProps extends TeacherTabScreenProps<"Attendance"> {}

export const AttendanceScreen: FC<AttendanceScreenProps> = observer(function AttendanceScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll">
      <Text text="attendance" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
