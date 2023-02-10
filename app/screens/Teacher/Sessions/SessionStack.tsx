import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { SelectStudentScreen } from "./SelectStudentScreen"
import { SessionSetupScreen } from "./SessionSetupScreen"
import { SessionScreen } from "./SessionScreen"
import { SessionNoteScreen } from "./SessionNoteScreen"

import { StackScreenProps } from "@react-navigation/stack"
import { SessionTypeScreen } from "./SessionTypeScreen"

export interface VersesListItem {
  type: "chapterTitle" | "verse"
  pageNumber?: number
  chapterNumber?: string
  chapterTitle: string
  verseNumber?: number
  verseText?: string
}

export type SessionStackParamList = {
  SelectStudent: undefined
  SessionType: undefined
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

export function SessionStackScreen() {
  return (
    <SessionStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SessionStack.Screen name="SelectStudent" component={SelectStudentScreen} />
      <SessionStack.Screen name="SessionType" component={SessionTypeScreen} />
      <SessionStack.Screen name="SessionSetup" component={SessionSetupScreen} />
      <SessionStack.Screen name="Session" component={SessionScreen} />
      <SessionStack.Screen name="SessionNote" component={SessionNoteScreen} />
    </SessionStack.Navigator>
  )
}
