/* eslint-disable react-native/no-inline-styles */
import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { SessionStackScreenProps } from "./SessionStack"
import { Alert, View } from "react-native"
import {
  Button,
  NoDrawerLayoutScreen,
  Text,
  TwoButtonsDialog,
  WarningDialog,
} from "../../../components"
import { colors, spacing } from "../../../theme"
import { Rating, AirbnbRating } from "react-native-ratings"
import { FlatList } from "react-native-gesture-handler"
import { Session, SessionModel } from "../../../models/Session"
import { v4 as uuidv4 } from "uuid"
import { useStores } from "../../../models"
import { useFocusEffect } from "@react-navigation/native"

export const ExamSessionScreen: FC<SessionStackScreenProps<"ExamSession">> = observer(
  function ExamSessionScreen({ navigation, route }) {
    const { examQNum } = route.params
    const [grades, setGrades] = useState(Array(examQNum).fill(0))
    const finalGrade = Math.round((grades.reduce((a, b) => a + b, 0) / examQNum) * 10) / 10

    const [done, setDone] = useState(false)
    const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false)
    const [doneDialogVisible, setDoneDialogVisible] = useState(false)

    // prevent back button
    // useFocusEffect(
    //   useCallback(() => {
    //     // Preventing accidental back button press: https://reactnavigation.org/docs/preventing-going-back/
    //     const handlaBackBtn = () => {
    //       navigation.addListener("beforeRemove", (e) => {
    //         if (done) {
    //           // If we don't have unsaved changes, then we don't need to do anything
    //           console.log("done don't show alert")

    //           return
    //         }

    //         // Prevent default behavior of leaving the screen
    //         e.preventDefault()

    //         // Prompt the user before leaving the screen

    //         Alert.alert(
    //           "هل تريد الرجوع؟",
    //           "لم يتم إنهاء الاختبار بعد. هل أنت متأكد من رغبتك في إلغاء الاختبار والرجوع؟",
    //           [
    //             { text: "متابعة الجلسة", style: "cancel", onPress: () => {} },
    //             {
    //               text: "إلغاء الجلسة والرجوع",
    //               style: "destructive",
    //               // If the user confirmed, then we dispatch the action we blocked earlier
    //               // This will continue the action that had triggered the removal of the screen
    //               onPress: () => navigation.dispatch(e.data.action),
    //             },
    //           ],
    //         )
    //       })
    //     }
    //     handlaBackBtn()
    //   }, [navigation, done]),
    // )

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

    const updateGrades = (index, value) => {
      setGrades(grades.map((grade, i) => (i === index ? value : grade)))
    }

    const { sessionStore } = useStores()

    const sendExamResult = () => {
      setDone(true)

      const session: Session = SessionModel.create({
        _id: uuidv4(),
        student_id: sessionStore.selectedStudent?.id,
        type: sessionStore.selectedSessionType,
        timestamp: new Date().toISOString(),
        exam_grade: finalGrade,
      })

      sessionStore.setProp("currentSessionNotes", [])
      sessionStore.setProp("selectedStudent", undefined)
      sessionStore.sendSession(session)
      setConfirmationDialogVisible(false)
      setDoneDialogVisible(true)
    }

    return (
      <NoDrawerLayoutScreen
        title={"جلسة اختبار حفظ"}
        backBtn={true}
        preset="auto"
        navigation={navigation}
        safeAreaEdge={["bottom"]}
      >
        <TwoButtonsDialog
          peachButtonFn={() => setConfirmationDialogVisible(false)}
          cyanButtonFn={sendExamResult}
          cancel={() => setConfirmationDialogVisible(false)}
          visible={confirmationDialogVisible}
          text={`النتيجة النهائية: \n ${finalGrade} من 5 \n\n هل تريد حفظ النتيجة والانتهاء؟`}
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
          text="تم حفظ جلسة الاختبار والإضافة إلى تقدم بالطالب علمياً بنجاح"
        />
        <View
          style={{
            alignContent: "center",
            paddingHorizontal: spacing.large,
            paddingBottom: spacing.large,
            paddingTop: spacing.small,
          }}
        >
          {grades.map((grade, index) => (
            <View
              style={{
                borderWidth: 1,
                borderRadius: spacing.extraSmall,
                borderColor: colors.ehkamGrey,
                paddingVertical: spacing.medium,
                marginBottom: spacing.medium,
              }}
              key={index}
            >
              <Text
                weight="medium"
                size="md"
                style={{ textAlign: "center", color: colors.ehkamDarkGrey }}
              >
                السؤال {index + 1}
              </Text>
              <AirbnbRating
                count={5}
                reviews={[]}
                reviewSize={0}
                defaultRating={0}
                size={30}
                onFinishRating={(value) => updateGrades(index, value)}
                selectedColor={colors.ehkamCyan}
              />
            </View>
          ))}

          <View
            style={{
              flexDirection: "row",
              flex: 1,
              width: "100%",
              justifyContent: "space-evenly",
            }}
          >
            <Button
              onPress={() => setConfirmationDialogVisible(true)}
              style={{
                backgroundColor: colors.ehkamCyan,
                width: 100,
                borderWidth: 0,
                borderRadius: 9,
              }}
            >
              <Text text="حفظ" style={{ color: colors.background }} />
            </Button>
          </View>
        </View>
      </NoDrawerLayoutScreen>
    )
  },
)
