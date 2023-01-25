import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { StudentProfileScreen } from "./StudentProfileScreen"
import { StudentsListScreen } from "./StudentsListScreen"
import { StackScreenProps } from "@react-navigation/stack"
import { colors } from "../../../theme"

export type StudentStackParamList = {
  StudentsList: undefined
  StudentProfile: {
    studentId: string
  }
}

export type StudentStackScreenProps<T extends keyof StudentStackParamList> = StackScreenProps<
  StudentStackParamList,
  T
>

const StudentStack = createNativeStackNavigator<StudentStackParamList>()

export function StudentStackScreen() {
  return (
    <StudentStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="StudentsList"
    >
      <StudentStack.Screen
        name="StudentsList"
        options={
          {
            // statusBarColor: colors.background,
            // statusBarStyle: "dark",
          }
        }
        component={StudentsListScreen}
      />
      <StudentStack.Screen
        name="StudentProfile"
        options={{
          headerTransparent: true,
          // statusBarTranslucent: true,
          // statusBarStyle: "auto",
        }}
        component={StudentProfileScreen}
      />
    </StudentStack.Navigator>
  )
}
