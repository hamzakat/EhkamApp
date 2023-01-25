/* eslint-disable react-native/no-inline-styles */
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Button, DrawerLayoutScreen, Text, VerseItem, WarningDialog } from "../../../components"

import React, { FC, useState } from "react"
import { SessionStackScreenProps, VersesListItem } from "./SessionStack"
import { FlatList } from "react-native-gesture-handler"
import { colors, spacing } from "../../../theme"
import { useStores } from "../../../models"
import { Session, SessionModel } from "../../../models/Session"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import { getSnapshot } from "mobx-state-tree"
import { TwoButtonsDialog } from "../../../components/"

export const SessionScreen: FC<SessionStackScreenProps<"Session">> = observer(
  function SessionScreen({ navigation, route }) {
    const { versesList, startChapter, startPage, startVerse, endChapter, endPage, endVerse } =
      route.params

    const { sessionStore } = useStores()

    const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false)
    const [doneDialogVisible, setDoneDialogVisible] = useState(false)
    const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)

    const sendSession = () => {
      console.log(11)

      const session: Session = SessionModel.create({
        _id: uuidv4(),
        start_chapter: startChapter,
        start_verse: startVerse,
        start_page: startPage,
        end_chapter: endChapter,
        end_page: endPage,
        end_verse: endVerse,
        notes: getSnapshot(sessionStore.currentSessionNotes),
        student_id: sessionStore.selectedStudent?.id,
        type: sessionStore.selectedSessionType,
        timestamp: new Date().toISOString(),
      })
      console.log(session)

      sessionStore.setProp("currentSessionNotes", [])
      sessionStore.setProp("selectedStudent", undefined)
      sessionStore.sendSession(session)
      setConfirmationDialogVisible(false)
      setDoneDialogVisible(true)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const scheduleSession = (time: "today" | "later") => {
      // TODO: add to notification area
    }
    const renderItem = ({ item }: { item: VersesListItem }) => {
      // render verse

      if (item.type === "verse") {
        return (
          <VerseItem
            verseNumber={item.verseNumber}
            verseText={item.verseText}
            onTouchEnd={() =>
              navigation.navigate("SessionNote", {
                pageNumber: parseInt(item.pageNumber),
                chpaterNumber: parseInt(item.chapterNumber),
                verseNumber: parseInt(item.verseNumber),
                verseText: item.verseText,
              })
            }
          />
        )
      }
      // render chapter title
      else if (item.type === "chapterTitle") {
        return (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              borderRadius: 12,
              marginBottom: spacing.small,

              paddingVertical: spacing.medium,
              alignItems: "center",
              backgroundColor: colors.background,
              justifyContent: "center",
              shadowColor: colors.palette.neutral800,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,

              elevation: 4,
            }}
          >
            <Text
              text={item.chapterTitle}
              weight="semiBold"
              size="lg"
              style={{ color: colors.ehkamPeach }}
            />
          </View>
        )
      }
    }
    return (
      <DrawerLayoutScreen title="جلسة تسميع جديدة" backBtn={true} navigation={navigation}>
        <TwoButtonsDialog
          peachButtonFn={() => setConfirmationDialogVisible(false)}
          cyanButtonFn={sendSession}
          cancel={() => setConfirmationDialogVisible(false)}
          visible={confirmationDialogVisible}
          text="هل تريد حفظ الجلسة"
        />
        <TwoButtonsDialog
          peachButtonFn={() => scheduleSession("later")}
          cyanButtonFn={() => scheduleSession("today")}
          cancel={() => setRepeatDialogVisible(false)}
          visible={repeatDialogVisible}
          text="متى سيعيد الطالب تسميع المقرر؟"
          peachButtonText="اليوم"
          cyanButtonText="الدرس القادم"
        />
        <WarningDialog
          preset="white"
          buttonText="متابعة"
          visible={doneDialogVisible}
          cancel={() => {
            setDoneDialogVisible(false)
            navigation.navigate("SelectStudent")
          }}
          text="تم حفظ جلسة التسميع والإضافة إلى تقدم بالطالب علمياً بنجاح"
        />
        <View style={{ maxHeight: 550 }}>
          <FlatList
            data={versesList}
            renderItem={renderItem}
            contentContainerStyle={{
              alignContent: "center",
              paddingHorizontal: spacing.large,
              paddingBottom: spacing.large,
              paddingTop: spacing.tiny,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: spacing.tiny,
            paddingHorizontal: spacing.large,
            marginBottom: spacing.large,
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
            onPress={() => setRepeatDialogVisible(true)}
          >
            <Text text="غير مقبول" weight="bold" size="md" style={{ color: colors.background }} />
          </Button>
          <Button
            style={{
              flex: 0.5,
              backgroundColor: colors.ehkamPeach,
              borderWidth: 0,
              borderRadius: 9,
            }}
            onPress={() => setConfirmationDialogVisible(true)}
          >
            <Text text="إتمام" weight="bold" size="md" style={{ color: colors.background }} />
          </Button>
        </View>
      </DrawerLayoutScreen>
    )
  },
)
