/* eslint-disable react-native/no-inline-styles */
import { observer } from "mobx-react-lite"
import { ScrollView, View } from "react-native"
import {
  Button,
  Icon,
  NoDrawerLayoutScreen,
  Text,
  TextField,
  Toggle,
  VerseItem,
  WarningDialog,
} from "../../../components"

import React, { FC, useEffect, useState } from "react"
import { SessionStackScreenProps } from "./SessionStack"
import { colors, spacing } from "../../../theme"
import { useStores } from "../../../models"
import { AyahNote, SessionNoteModel } from "../../../models/SessionNote"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import { getSnapshot } from "mobx-state-tree"

export const SessionNoteScreen: FC<SessionStackScreenProps<"SessionNote">> = observer(
  function SessionNoteScreen({ navigation, route }) {
    const { pageNumber, chapterNumber, verseNumber, verseText, index } = route.params
    __DEV__ && console.log("pageNumber", pageNumber)

    const { sessionStore } = useStores()
    const [tajweed, setTajweed] = useState(false)
    const [pronunciation, setPronunciation] = useState(false)
    const [memorization, setMemorization] = useState(false)
    const [text, setText] = useState("")

    useEffect(() => {
      const existingNote: AyahNote = sessionStore.currentSessionNotes.find(
        (note) =>
          note.chapter_number === chapterNumber &&
          note.verse_number === verseNumber &&
          note.page_number === pageNumber,
      )
      if (existingNote) {
        setTajweed(existingNote.tajweed)
        setPronunciation(existingNote.pronunciation)
        setMemorization(existingNote.memorization)

        setText(existingNote.text)
      }
    }, [])

    const [dialogVisible, setDialogVisible] = useState(false)

    const toggleTajweed = () => {
      tajweed ? setTajweed(false) : setTajweed(true)
    }

    const togglePron = () => {
      pronunciation ? setPronunciation(false) : setPronunciation(true)
    }

    const toggleMemo = () => {
      memorization ? setMemorization(false) : setMemorization(true)
    }

    const addNote = () => {
      const existingNoteIndex = sessionStore.currentSessionNotes.findIndex(
        (note) =>
          note.chapter_number === chapterNumber &&
          note.verse_number === verseNumber &&
          note.page_number === pageNumber,
      )
      if (tajweed || pronunciation || memorization) {
        if (existingNoteIndex !== -1) {
          // Note with the same chapter, verse, and page already exists, update it
          const updatedNotes = [...sessionStore.currentSessionNotes]
          updatedNotes[existingNoteIndex] = {
            ...updatedNotes[existingNoteIndex],
            tajweed,
            memorization,
            pronunciation,
            text,
          }

          sessionStore.setProp("currentSessionNotes", updatedNotes)
        } else {
          // No existing note found, add a new one
          sessionStore.setProp("currentSessionNotes", [
            ...sessionStore.currentSessionNotes,
            SessionNoteModel.create({
              _id: uuidv4(),
              chapter_number: chapterNumber,
              verse_number: verseNumber,
              page_number: pageNumber,
              tajweed,
              memorization,
              pronunciation,
              text,
              session_id: "",
            }),
          ])
        }

        // update the verse list
        const newVersesList = [...sessionStore.currentSessionVerses]
        const _updated = {
          ...newVersesList[index],
          flagged: true,
        }
        newVersesList[index] = _updated
        sessionStore.setProp("currentSessionVerses", newVersesList)

        navigation.goBack()
      } else {
        if (existingNoteIndex !== -1) {
          // Note with the same chapter, verse, and page already exists, update it
          const updatedNotes = [...sessionStore.currentSessionNotes]

          updatedNotes.splice(existingNoteIndex, 1)
          sessionStore.setProp("currentSessionNotes", updatedNotes)
          // update the verse list
          const newVersesList = [...sessionStore.currentSessionVerses]
          const _updated = {
            ...newVersesList[index],
            flagged: false,
          }
          newVersesList[index] = _updated
          sessionStore.setProp("currentSessionVerses", newVersesList)
        }

        navigation.goBack()
      }
    }

    return (
      <NoDrawerLayoutScreen
        title="تسجيل خطأ / ملاحظة"
        backBtn={true}
        navigation={navigation}
        Icon={
          <Icon
            icon="commentBlock"
            style={{ marginStart: spacing.large, marginEnd: spacing.medium }}
            size={spacing.large}
          />
        }
        safeAreaEdge={[]}
      >
        <WarningDialog
          text="تأكد من تحديد نوع الخطاً"
          cancel={() => setDialogVisible(false)}
          visible={dialogVisible}
          preset="peach"
          buttonText="الرجوع"
        />
        <View
          style={{
            alignContent: "center",
            paddingHorizontal: spacing.large,
            paddingBottom: spacing.large,
            marginTop: spacing.medium,
          }}
        >
          <VerseItem verseNumber={verseNumber} verseText={verseText} />
          <View style={{ marginTop: spacing.large }}>
            <View style={{ flexDirection: "row", marginBottom: spacing.small }}>
              <Icon
                icon="info"
                color={colors.ehkamCyan}
                size={spacing.large}
                style={{ marginEnd: spacing.medium }}
              />
              <Text text="اختر نوع الخطأ" weight="book" style={{ color: colors.ehkamCyan }} />
            </View>
            <Toggle
              label="خطأ تجويدي"
              labelStyle={{ color: tajweed ? colors.ehkamPeach : colors.ehkamDarkGrey }}
              value={tajweed}
              onPress={toggleTajweed}
              inputOuterStyle={{
                backgroundColor: colors.background,
                borderRadius: 8,
                borderColor: tajweed ? colors.ehkamPeach : colors.ehkamDarkGrey,
              }}
              inputInnerStyle={{ backgroundColor: colors.background }}
              inputDetailStyle={{
                tintColor: colors.ehkamPeach,
              }}
              containerStyle={{ marginBottom: spacing.small }}
            />
            <Toggle
              label="خطأ في النطق"
              labelStyle={{ color: pronunciation ? colors.ehkamPeach : colors.ehkamDarkGrey }}
              value={pronunciation}
              onPress={togglePron}
              inputOuterStyle={{
                backgroundColor: colors.background,
                borderRadius: 8,
                borderColor: pronunciation ? colors.ehkamPeach : colors.ehkamDarkGrey,
              }}
              inputInnerStyle={{ backgroundColor: colors.background }}
              inputDetailStyle={{
                tintColor: colors.ehkamPeach,
              }}
              containerStyle={{ marginBottom: spacing.small }}
            />
            <Toggle
              label="خطأ حفظي"
              labelStyle={{ color: memorization ? colors.ehkamPeach : colors.ehkamDarkGrey }}
              value={memorization}
              onPress={toggleMemo}
              inputOuterStyle={{
                backgroundColor: colors.background,
                borderRadius: 8,
                borderColor: memorization ? colors.ehkamPeach : colors.ehkamDarkGrey,
              }}
              inputInnerStyle={{ backgroundColor: colors.background }}
              inputDetailStyle={{
                tintColor: colors.ehkamPeach,
              }}
              containerStyle={{ marginBottom: spacing.small }}
            />
          </View>
          <View style={{ marginTop: spacing.large }}>
            <View style={{ flexDirection: "row", marginBottom: spacing.small }}>
              <Icon
                icon="record"
                color={colors.ehkamCyan}
                size={spacing.large}
                style={{ marginEnd: spacing.medium }}
              />
              <Text text="سجل الملاحظة" weight="book" style={{ color: colors.ehkamCyan }} />
            </View>
            <TextField
              inputWrapperStyle={{
                borderColor: colors.ehkamPeach,
                borderRadius: spacing.small,
                backgroundColor: colors.background,
                height: 150,
              }}
              value={text}
              onChangeText={setText}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: spacing.large,
              paddingBottom: spacing.massive,
              marginBottom: spacing.extraLarge,
            }}
          >
            <Button
              style={{
                flex: 0.5,
                marginEnd: spacing.extraSmall,
                backgroundColor: colors.ehkamGrey,
                borderWidth: 0,
                borderRadius: 9,
              }}
              onPress={() => navigation.goBack()}
            >
              <Text text="تراجع" weight="bold" size="md" style={{ color: colors.background }} />
            </Button>
            <Button
              style={{
                flex: 0.5,
                backgroundColor: colors.ehkamPeach,
                borderWidth: 0,
                borderRadius: 9,
              }}
              onPress={addNote}
            >
              <Text text="حفظ" weight="bold" size="md" style={{ color: colors.background }} />
            </Button>
          </View>
        </View>
      </NoDrawerLayoutScreen>
    )
  },
)
