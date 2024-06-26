import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import React from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "../components"
import {
  AttendanceScreen,
  MessagesScreen,
  SessionStackScreen,
  SessionStackParamList,
} from "../screens/Teacher"
import { StudentStackParamList, StudentStackScreen } from "../screens/Teacher/Students/StudentStack"

import { colors, spacing, typography } from "../theme"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"

export type TeacherTabParamList = {
  Students: NavigatorScreenParams<StudentStackParamList>
  Sessions: NavigatorScreenParams<SessionStackParamList>
  Attendance: undefined
  Messages: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type TeacherTabScreenProps<T extends keyof TeacherTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TeacherTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<TeacherTabParamList>()

export function TeacherNavigator() {
  const { bottom } = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [$tabBar, { height: bottom + 70 }],
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
        tabBarShowLabel: false,
      }}
      defaultScreenOptions={{}}
      initialRouteName="Attendance"
    >
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarLabel: "Attendance",
          tabBarIcon: ({ focused }) => (
            <View style={focused ? $tabBarIconContainerActive : $tabBarIconContainer}>
              <Icon icon="persontime" style={$tabBarIcon} color={focused && colors.background} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Sessions"
        component={SessionStackScreen}
        options={{
          tabBarLabel: "Sessions",
          tabBarIcon: ({ focused }) => (
            <View style={focused ? $tabBarIconContainerActive : $tabBarIconContainer}>
              <Icon icon="book" style={$tabBarIcon} color={focused && colors.background} />
            </View>
          ),
        }}
        initialParams={{ screen: "SessionType" }}
      />

      <Tab.Screen
        name="Students"
        component={StudentStackScreen}
        options={{
          tabBarLabel: "Students",
          tabBarIcon: ({ focused }) => (
            <View style={focused ? $tabBarIconContainerActive : $tabBarIconContainer}>
              <Icon icon="people" style={$tabBarIcon} color={focused && colors.background} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: ({ focused }) => (
            <View style={focused ? $tabBarIconContainerActive : $tabBarIconContainer}>
              <Icon icon="envelope" style={$tabBarIcon} color={focused && colors.background} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}

export const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopWidth: 0,
  borderColor: colors.background,
  borderTopEndRadius: 20,
  borderTopStartRadius: 20,
  shadowColor: colors.shadow,
  shadowOffset: {
    width: 0,
    height: 12,
  },
  shadowOpacity: 0.58,
  shadowRadius: 5.0,

  elevation: 10,
  position: "absolute",
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.small,
  paddingBottom: spacing.small,
}

const $tabBarIconContainer: ViewStyle = {
  width: 48,
  height: 48,
  alignItems: "center",
  justifyContent: "center",
}
const $tabBarIconContainerActive: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 25,

  backgroundColor: colors.tint,
  justifyContent: "center",
  shadowColor: colors.shadow,
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,

  elevation: 3,
}
const $tabBarIcon: ImageStyle = {
  width: 25.65,
  height: 17.11,
  alignSelf: "center",
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  flex: 1,
}
