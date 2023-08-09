/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native"
import React, { FC, useEffect, useState } from "react"
import { ActivityIndicator, Dimensions, View } from "react-native"
import { AutoImage, Button, Card, Icon, Screen, Text, Toggle } from "../components"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { useStores } from "../models"
import { AttendanceRecordModel } from "../models/AttendanceRecord"
import { AttendanceItemModel } from "../models/AttendanceItem"
import { v4 as uuidv4 } from "uuid"
import { delay } from "../utils/delay"
import { getSnapshot } from "mobx-state-tree"

interface EnterScreenProps extends AppStackScreenProps<"Enter"> {}

const headerImg = require("../../assets/images/welcome-header.png")
export const EnterScreen: FC<EnterScreenProps> = function EnterScreen(_props) {
  const {
    currentUserStore,
    attendanceStore,
    studentStore,
    sessionStore,
    settingStore,
    authenticationStore,
  } = useStores()

  const [selectedClass, setSelectedClass] = useState(
    currentUserStore.assignedClasses[0]
      ? getSnapshot(currentUserStore.assignedClasses[0])
      : undefined,
  )

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // fetch current user data

    ;(async function fetchCurrentUser() {
      await currentUserStore.fetchCurrentUser()
      __DEV__ && console.log("Loading current user from Enter Screen")
    })()
  }, [])

  const loadStores = async () => {
    await studentStore.fetchStudents()
    await attendanceStore.fetchAttendanceRecords()
    await sessionStore.fetchSessions()
    await settingStore.fetchSchoolSettings()
    __DEV__ && console.log("Loading stores from Enter Screen")
  }

  const createNewAttendanceRecord = (timestamp: string): void => {
    __DEV__ && console.log("CREATING NEW ATTENDANCE RECORD")

    attendanceStore.setProp(
      "currentAttendanceRecord",
      AttendanceRecordModel.create({
        _id: uuidv4(),
        timestamp,
        items:
          studentStore.students.length > 0
            ? studentStore.students.map((student, i) => {
                return AttendanceItemModel.create({
                  student_id: student.id,
                  present: false,
                })
              })
            : [],
      }),
    )
  }

  /**
   * We should first do the following in order when the screen loads:
   * 1. load the stores
   * 2. create a new attendance record if there's no current record
   *
   */

  const enter = () => {
    if (!selectedClass) {
      return
    }
    setIsLoading(true)
    // set the current class
    currentUserStore.setProp("currentClass", selectedClass)

    const timestamp = new Date().toISOString()

    // create a new empty record on a fresh app start
    __DEV__ && console.log("Entering the system")
    loadStores()
      .then(() => createNewAttendanceRecord(timestamp))
      .then(() => attendanceStore.setProp("currentAttendanceRecordChanged", false))
      .then(() => currentUserStore.setProp("entered", true))
      .then(() => setIsLoading(false))
  }

  return (
    <Screen preset="auto" safeAreaEdges={["top", "bottom"]}>
      <AutoImage
        source={headerImg}
        style={{
          alignSelf: "center",
          width: "100%",
          height: 400,
          paddingHorizontal: 0,
          paddingBottom: spacing.large,
          top: 1,
        }}
        resizeMethod="auto"
        resizeMode="cover"
      />

      <View
        style={{
          justifyContent: "space-around",
          marginTop: spacing.medium,

          paddingHorizontal: spacing.large,
          paddingBottom: Dimensions.get("screen").height * 0.1,
        }}
      >
        {currentUserStore.assignedClasses.length > 0 && (
          <>
            <View style={{ marginTop: spacing.small }}>
              {currentUserStore.assignedClasses.map((teacherClass, i) => {
                return (
                  <TeacherClassCard
                    key={i}
                    teacherClass={teacherClass}
                    selected={selectedClass?.id === teacherClass.id}
                    onPress={() => setSelectedClass(getSnapshot(teacherClass))}
                  />
                )
              })}
            </View>

            <Button
              preset="reversed"
              style={{
                marginTop: spacing.large,
                backgroundColor: colors.ehkamPeach,
                borderRadius: 20,
              }}
              textStyle={{ flexDirection: "row" }}
              onPress={enter}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.large,
                }}
              >
                <View style={{ marginEnd: spacing.small }}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Icon icon="leftStickArrow" size={spacing.medium} />
                  )}
                </View>
                <Text weight="medium" text="ادخل إلى النظام" style={{ color: colors.background }} />
              </View>
            </Button>
            <Button
              preset="reversed"
              style={{
                marginTop: spacing.large,
                backgroundColor: colors.background,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.ehkamPeach,
              }}
              textStyle={{ flexDirection: "row" }}
              onPress={authenticationStore.logOut}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.large,
                }}
              >
                <Icon
                  icon="exit"
                  color={colors.ehkamPeach}
                  size={spacing.medium}
                  containerStyle={{ marginEnd: spacing.small }}
                />
                <Text weight="medium" text="تسجيل الخروج" style={{ color: colors.ehkamPeach }} />
              </View>
            </Button>
          </>
        )}
        {currentUserStore.assignedClasses.length === 0 && (
          <>
            <View style={{ alignItems: "center" }}>
              <Text
                text={`لم يتم إسنادك إلى أية حلقة حتى الآن `}
                weight="medium"
                size="lg"
                style={{ color: colors.ehkamDarkGrey, textAlign: "center" }}
              />
            </View>
            <Button
              preset="reversed"
              style={{
                marginTop: spacing.large,
                backgroundColor: colors.ehkamPeach,
                borderRadius: 20,
              }}
              textStyle={{ flexDirection: "row" }}
              onPress={authenticationStore.logOut}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.large,
                }}
              >
                <Icon
                  icon="exit"
                  color={colors.background}
                  size={spacing.medium}
                  containerStyle={{ marginEnd: spacing.small }}
                />
                <Text weight="medium" text="تسجيل الخروج" style={{ color: colors.background }} />
              </View>
            </Button>
          </>
        )}
      </View>
    </Screen>
  )
}

const TeacherClassCard = ({ teacherClass, selected, onPress }) => {
  return (
    <Card
      HeadingComponent={
        <View
          style={{
            justifyContent: "center",
            paddingTop: spacing.extraSmall,
          }}
        >
          <Text
            text={teacherClass.name}
            weight="semiBold"
            size="lg"
            style={{ color: selected ? colors.ehkamPeach : colors.ehkamGrey }}
          />
        </View>
      }
      LeftComponent={
        <View
          style={{
            justifyContent: "center",
            marginVertical: spacing.large,
            marginStart: spacing.small,
          }}
        >
          <Toggle
            variant="radio"
            inputOuterStyle={{
              width: 18.3,
              height: 18.3,
              justifyContent: "center",

              borderColor: colors.ehkamPeach,
              backgroundColor: colors.background,
            }}
            inputInnerStyle={{
              backgroundColor: colors.background,
            }}
            inputDetailStyle={{
              backgroundColor: colors.ehkamPeach,
              width: 9,
              height: 9,
              borderRadius: 25,
            }}
            value={selected}
          />
        </View>
      }
      FooterComponent={
        <View>
          <Text
            text={teacherClass.mosque_name}
            weight="book"
            size="xs"
            style={{ color: selected ? colors.ehkamPeach : colors.ehkamGrey }}
          />
        </View>
      }
      style={{
        backgroundColor: colors.background,
        marginBottom: spacing.small,
        alignItems: "center",
        paddingVertical: spacing.small,
        shadowColor: selected ? colors.ehkamPeach : colors.shadow,

        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
      }}
      onPress={onPress}
    />
  )
}
