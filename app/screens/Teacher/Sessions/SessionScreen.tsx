/* eslint-disable react-native/no-inline-styles */
import { observer } from "mobx-react-lite"
import { Alert, View, Dimensions } from "react-native"
import {
  Button,
  DrawerLayoutScreen,
  Icon,
  Text,
  TextField,
  VerseItem,
  WarningDialog,
} from "../../../components"

import React, { FC, useEffect, useState } from "react"
import { SessionStackScreenProps, VersesListItem } from "./SessionStack"
import { FlatList } from "react-native-gesture-handler"
import { colors, spacing } from "../../../theme"
import { useStores } from "../../../models"
import { Session, SessionModel } from "../../../models/Session"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import { getSnapshot } from "mobx-state-tree"
import { TwoButtonsDialog } from "../../../components/"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Dialog } from "react-native-simple-dialogs"

const windowHeight = Dimensions.get("window").height
const ayatListHeight = windowHeight * 0.75

export const SessionScreen: FC<SessionStackScreenProps<"Session">> = observer(
  function SessionScreen({ navigation, route }) {
    const { versesList, startChapter, startPage, startVerse, endChapter, endPage, endVerse } =
      route.params

    const { sessionStore } = useStores()

    const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false)
    const [doneDialogVisible, setDoneDialogVisible] = useState(false)
    const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)
    const [done, setDone] = useState(false)
    const [grade, setGrade] = useState("")
    const [gradeError, setGradeError] = useState("")
    const [gradeValid, setGradeValid] = useState(false)
    const { bottom } = useSafeAreaInsets()

    React.useEffect(
      // Preventing accidental back button press: https://reactnavigation.org/docs/preventing-going-back/
      () =>
        navigation.addListener("beforeRemove", (e) => {
          if (done) {
            // If we don't have unsaved changes, then we don't need to do anything
            return
          }

          // Prevent default behavior of leaving the screen
          e.preventDefault()

          // Prompt the user before leaving the screen

          Alert.alert(
            "هل تريد الرجوع؟",
            "لم يتم إنهاء الجلسة بعد. هل أنت متأكد من رغبتك في إلغاء الجلسة والرجوع؟",
            [
              { text: "متابعة الجلسة", style: "cancel", onPress: () => {} },
              {
                text: "إلغاء الجلسة والرجوع",
                style: "destructive",
                // If the user confirmed, then we dispatch the action we blocked earlier
                // This will continue the action that had triggered the removal of the screen
                onPress: () => navigation.dispatch(e.data.action),
              },
            ],
          )
        }),
      [navigation, done],
    )
    const handleInputChange = (text) => {
      // Validate the input value
      const numericValue = parseInt(text)
      if (numericValue >= 0 && numericValue <= 100) {
        setGradeError("")
        setGradeValid(true)
      } else if (text === "") {
        setGradeError("")
        setGradeValid(false)
      } else {
        setGradeError("ادخل قيمة بين 0 و 100")
        setGradeValid(false)
      }
      setGrade(text)
    }

    const sendSession = () => {
      setDone(true)

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
        grade: parseInt(grade),
      })

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
        {/* <TwoButtonsDialog
          peachButtonFn={() => setConfirmationDialogVisible(false)}
          cyanButtonFn={sendSession}
          cancel={() => setConfirmationDialogVisible(false)}
          visible={confirmationDialogVisible}
          text="هل تريد حفظ الجلسة"
        /> */}

        {/* Grade dialog */}
        <Dialog
          visible={confirmationDialogVisible}
          onTouchOutside={() => setConfirmationDialogVisible(false)}
          dialogStyle={{
            backgroundColor: colors.background,
            borderRadius: spacing.small,
          }}
        >
          <View>
            <Icon
              icon="x"
              style={{ position: "absolute", top: -12, right: -12, alignSelf: "flex-end" }}
              color={colors.ehkamDarkGrey}
              onPress={() => setConfirmationDialogVisible(false)}
            />

            <Text
              weight="medium"
              text={"أدخل تقييم الجلسة"}
              style={{
                color: colors.ehkamDarkGrey,
                textAlign: "center",
                marginVertical: spacing.medium,
              }}
              size="md"
            />
            <TextField
              placeholder="درجة مئوية"
              keyboardType="number-pad"
              value={grade}
              onChangeText={handleInputChange}
              LeftAccessory={() => <Text style={{ marginHorizontal: spacing.tiny }}>%</Text>}
              inputWrapperStyle={{
                alignItems: "center",
                maxWidth: 150,
              }}
              containerStyle={{ alignItems: "center" }}
            />
            {gradeError ? (
              <Text
                weight="light"
                size="xs"
                style={{ color: colors.ehkamRed, marginTop: spacing.small }}
              >
                {gradeError}
              </Text>
            ) : null}
            {gradeValid ? (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: spacing.medium,
                  justifyContent: "space-around",
                }}
              >
                <Button
                  text={"حفظ"}
                  textStyle={{ color: colors.background }}
                  style={{
                    borderWidth: 0,
                    borderRadius: spacing.small,
                    width: 75,
                    backgroundColor: colors.ehkamCyan,
                  }}
                  onPress={sendSession}
                />
              </View>
            ) : null}
          </View>
        </Dialog>

        {/* Cancelation dialog */}
        <TwoButtonsDialog
          peachButtonFn={() => scheduleSession("later")}
          cyanButtonFn={() => scheduleSession("today")}
          cancel={() => setRepeatDialogVisible(false)}
          visible={repeatDialogVisible}
          text="متى سيعيد الطالب تسميع المقرر؟"
          peachButtonText="اليوم"
          cyanButtonText="الدرس القادم"
        />

        {/* Done dialog */}
        <WarningDialog
          preset="white"
          buttonText="متابعة"
          visible={doneDialogVisible}
          cancel={() => {
            setDoneDialogVisible(false)
            navigation.navigate("SessionType")
          }}
          text="تم حفظ جلسة التسميع والإضافة إلى تقدم بالطالب علمياً بنجاح"
        />
        <View style={{ maxHeight: ayatListHeight }}>
          <FlatList
            data={versesList}
            renderItem={renderItem}
            contentContainerStyle={{
              alignContent: "center",
              paddingHorizontal: spacing.large,
              paddingBottom: spacing.large,
              paddingTop: spacing.small,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: spacing.tiny,
            paddingHorizontal: spacing.large,
            marginBottom: bottom,
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
