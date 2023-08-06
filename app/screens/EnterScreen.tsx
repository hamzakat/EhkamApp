/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native"
import React, { FC, useEffect } from "react"
import { View } from "react-native"
import { AutoImage, Button, Icon, Screen, Text } from "../components"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { useStores } from "../models"
import { AttendanceRecordModel } from "../models/AttendanceRecord"
import { AttendanceItemModel } from "../models/AttendanceItem"
import { v4 as uuidv4 } from "uuid"

interface EnterScreenProps extends AppStackScreenProps<"Enter"> {}

const headerImg = require("../../assets/images/welcome-header.png")
export const EnterScreen: FC<EnterScreenProps> = function EnterScreen(_props) {
  const { currentUserStore, attendanceStore, studentStore } = useStores()

  const loadStores = () => {
    ;(async function load() {
      await currentUserStore.fetchCurrentUser()
      await studentStore.fetchStudents()
      await attendanceStore.fetchAttendanceRecords()
      __DEV__ && console.log("Loading stores from Attendance Screen")
    })()
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

  // load stores
  useEffect(() => {
    loadStores()
  }, [])

  const enter = () => {
    const timestamp = new Date().toISOString()

    // create a new empty record on a fresh app start
    __DEV__ && console.log("Entering the system")
    createNewAttendanceRecord(timestamp)
    attendanceStore.setProp("currentAttendanceRecordChanged", false)
    currentUserStore.setProp("entered", true)
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
        style={{ justifyContent: "space-around", alignItems: "center", marginTop: spacing.medium }}
      >
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
            style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.large }}
          >
            <Icon
              icon="leftStickArrow"
              size={spacing.medium}
              containerStyle={{ marginEnd: spacing.small }}
            />
            <Text weight="medium" text="ادخل إلى النظام" style={{ color: colors.background }} />
          </View>
        </Button>
      </View>
    </Screen>
  )
}
