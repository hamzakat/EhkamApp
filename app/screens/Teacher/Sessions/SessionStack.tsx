import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { SelectStudentScreen } from "./SelectStudentScreen"
import { SessionSetupScreen } from "./SessionSetupScreen"
import { SessionScreen } from "./SessionScreen"
import { SessionNoteScreen } from "./SessionNoteScreen"

import { StackScreenProps } from "@react-navigation/stack"
import { SessionTypeScreen } from "./SessionTypeScreen"
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"
import { $tabBar } from "../../../navigators/TeacherNavigator"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ExamSessionScreen } from "./ExamSessionScreen"

export interface VersesListItem {
  type: "chapterTitle" | "verse"
  pageNumber?: number
  chapterNumber?: string
  chapterTitle: string
  verseNumber?: number
  verseText?: string
}

export type SessionStackParamList = {
  SessionType: undefined
  SelectStudent: undefined
  ExamSession: {
    examQNum: number
  }
  SessionSetup: undefined
  Session: {
    startPage: number
    endPage: number
    startChapter: number
    endChapter: number
    startVerse: number
    endVerse: number
    versesList: VersesListItem[]
  }

  SessionNote: {
    pageNumber: string
    verseText: string
    verseNumber: string
    chpaterNumber: string
  }
}

export type SessionStackScreenProps<T extends keyof SessionStackParamList> = StackScreenProps<
  SessionStackParamList,
  T
>

const SessionStack = createNativeStackNavigator<SessionStackParamList>()

export function SessionStackScreen({ navigation, route }) {
  const { bottom } = useSafeAreaInsets()
  const tabHiddenRoutes = ["Session", "SessionNote", "ExamSession"]

  React.useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route)
    if (tabHiddenRoutes.includes(routeName)) {
      navigation.setOptions({ tabBarStyle: { display: "none" } })
    } else {
      navigation.setOptions({ tabBarStyle: [$tabBar, { height: bottom + 70 }] })
    }
  }, [navigation, route])

  return (
    <SessionStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="SessionType"
    >
      <SessionStack.Screen name="SessionType" component={SessionTypeScreen} />
      <SessionStack.Screen name="SelectStudent" component={SelectStudentScreen} />
      <SessionStack.Screen name="ExamSession" component={ExamSessionScreen} />
      <SessionStack.Screen name="SessionSetup" component={SessionSetupScreen} />
      <SessionStack.Screen name="Session" component={SessionScreen} />
      <SessionStack.Screen name="SessionNote" component={SessionNoteScreen} />
    </SessionStack.Navigator>
  )
}
