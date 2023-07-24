/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { Observer, observer } from "mobx-react-lite"
import { ActivityIndicator, Dimensions, FlatList, View, ViewStyle } from "react-native"
import {
  DrawerLayoutScreen,
  EmptyState,
  ModalSelect,
  StudentCard,
  Text,
  Toggle,
  TwoButtonsDialog,
} from "../../components"
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { colors, spacing } from "../../theme"
import { delay } from "../../utils/delay"
import { AttendanceRecordModel, AttendanceRecord } from "../../models/AttendanceRecord"
import { AttendanceItem, AttendanceItemModel } from "../../models/AttendanceItem"
import { Student } from "../../models/Student"
import { getSnapshot, onSnapshot } from "mobx-state-tree"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import { set } from "date-fns"

interface AttendanceScreenProps extends TeacherTabScreenProps<"Attendance"> {}

const ONE_DAY = 24 * 60 * 60 * 1000
const today = new Date()

export const AttendanceScreen: FC<AttendanceScreenProps> = observer(function AttendanceScreen() {
  const { attendanceStore, studentStore, sessionStore, currentUserStore } = useStores()
  const navigation = useNavigation()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const statsFilters = [
    { key: 1, label: "إجمالي" },
    { key: 2, label: "اليوم" },
    { key: 3, label: "الاسبوع" },
    { key: 4, label: "الشهر" },
  ]

  const [statsFilter, setStatsFilter] = useState(statsFilters[0])

  const [attendanceRate, setAttendanceRate] = useState(0)
  const [sessionsRate, setSessionsRate] = useState(0)

  // update the rates based on the filter
  useEffect(() => {
    let _attendanceRate = 0
    if (statsFilter.key === 1) _attendanceRate = attendanceStore.getRates("total")
    if (statsFilter.key === 3) _attendanceRate = attendanceStore.getRates("week")
    if (statsFilter.key === 4) _attendanceRate = attendanceStore.getRates("month")

    setAttendanceRate(_attendanceRate)

    // update the sessions rate
    const filteredAttendanceRecords = attendanceStore.attendanceRecords
      .slice()
      .sort((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1))
      .filter((record: AttendanceRecord) => {
        const attendanceRecordDate = new Date(record.timestamp)
        if (statsFilter.key === 1) return true
        if (statsFilter.key === 3) return today - attendanceRecordDate <= ONE_DAY * 7
        if (statsFilter.key === 4) return today - attendanceRecordDate <= ONE_DAY * 30
      })

    const ratesOfSessionOnEveryDay = filteredAttendanceRecords.map((record: AttendanceRecord) => {
      const numOfPresetStudents = record.getNumberOfPresent()
      if (numOfPresetStudents === 0) return 0 // prevent division by zero

      const numOfSessions = sessionStore.getSessionsByDate(new Date(record.timestamp)).length

      let sessionsRate = Math.round((numOfSessions / numOfPresetStudents) * 100)
      if (sessionsRate > 100) sessionsRate = 100
      return sessionsRate
    })

    // sum the rates of sessions on every day and divide by the number of days
    const _sessionsRate = Math.round(
      ratesOfSessionOnEveryDay.reduce((a, b) => a + b, 0) / ratesOfSessionOnEveryDay.length,
    )

    setSessionsRate(_sessionsRate)
  }, [statsFilter, attendanceStore])

  const [currentAttendanceRate, setCurrentAttendanceRate] = useState(0)
  const [currentSessionsRate, setCurrentSessionsRate] = useState(0)

  // update the current rates
  useEffect(() => {
    const dispose = onSnapshot(attendanceStore.currentAttendanceRecord.items, (change) => {
      console.log("DATE", today.toISOString().substring(0, 10))

      setCurrentAttendanceRate(attendanceStore.currentAttendanceRecord.getRate())

      let _currentSessionsRate = 0
      const numOfPresetStudents = attendanceStore.currentAttendanceRecord.getNumberOfPresent()
      if (numOfPresetStudents === 0) _currentSessionsRate = 0 // prevent division by zero
      else {
        const numOfSessions = sessionStore.getSessionsByDate(
          new Date(attendanceStore.currentAttendanceRecord.timestamp),
        ).length
        _currentSessionsRate = Math.round((numOfSessions / numOfPresetStudents) * 100)
        if (_currentSessionsRate > 100) _currentSessionsRate = 100
      }
      setCurrentSessionsRate(_currentSessionsRate)
    })
    return () => {
      dispose() // Cleanup the observer when the component unmounts
    }
  }, [attendanceStore.currentAttendanceRecord, sessionStore])

  const loadStores = async () => {
    await studentStore.fetchStudents()
    await attendanceStore.fetchAttendanceRecords()
    __DEV__ && console.log("Loading stores from Attendance Screen")
  }

  useEffect(() => {
    loadStores()
  }, [studentStore, attendanceStore])

  useEffect(() => {
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

    // check today's date
    const timestamp = new Date().toISOString()

    loadStores()

    // *** auto create a new record if there's no current record ***
    // const todayDate = timestamp.substring(0, 10) // yyyy-mm-dd
    // const currentAttendanceRecord: AttendanceRecord = attendanceStore.currentAttendanceRecord

    // eslint-disable-next-line no-extra-boolean-cast
    // if (!!currentAttendanceRecord) {
    //   // check if it's a new day
    //   if (currentAttendanceRecord?.timestamp.substring(0, 10) !== todayDate) {
    //     __DEV__ && console.log("NEW DAY")
    //     if (currentAttendanceRecord.items.length > 0) {
    //       // push the old record to the store (if it holds items) AND send the old record to the server
    //       attendanceStore.sendAttendanceRecord(getSnapshot(currentAttendanceRecord))
    //     }

    //     // create a new empty record on new day
    //     createNewAttendanceRecord(timestamp)
    //   }
    // } else {
    __DEV__ && console.log("FRESH APP LAUNCH")

    // create a new empty record on a fresh app start
    createNewAttendanceRecord(timestamp)
  }, [])

  const renderAttendanceItem = ({ item }: { item: AttendanceItem }) => {
    const student = studentStore.students.find((student) => student.id === item.student_id)

    if (student) {
      return (
        // Useful resources:
        // https://github.com/mobxjs/mobx-state-tree/discussions/1904
        // https://github.com/mobxjs/mobx/issues/1142#issuecomment-323161298

        <Observer>
          {() => (
            <AttendanceCard
              key={student.id}
              student={student}
              onPress={() => item.toggle()}
              present={item.present}
            />
          )}
        </Observer>
      )
    }
  }

  const manualRefresh = async () => {
    setRefreshing(true)
    console.log("refreshing...")

    await Promise.all([studentStore.fetchStudents(), delay(750)])
    setRefreshing(false)
  }

  const exit = async () => {
    const currentAttendanceRecord: AttendanceRecord = attendanceStore.currentAttendanceRecord
    if (currentAttendanceRecord.items.length > 0) {
      // push the old record to the store (if it holds items) AND send the old record to the server
      await attendanceStore.sendAttendanceRecord(getSnapshot(currentAttendanceRecord))
    }
    currentUserStore.setProp("entered", false)
  }

  const [showExitDialog, setShowExitDialog] = useState(false)

  return (
    <DrawerLayoutScreen
      title="الحضور"
      navigation={navigation}
      backBtn={false}
      element={
        <View>
          <Text
            onPress={() => setShowExitDialog(true)}
            size="sm"
            weight="book"
            style={{ color: colors.ehkamPeach, marginRight: spacing.medium }}
          >
            إنهاء الدوام
          </Text>
        </View>
      }
    >
      <TwoButtonsDialog
        text="⌚ هل أنت متأكد من انتهاء فترة الدوام؟"
        cyanButtonText="نعم"
        peachButtonText="لا"
        cyanButtonFn={exit}
        visible={showExitDialog}
        peachButtonFn={() => setShowExitDialog(false)}
        cancel={() => setShowExitDialog(false)}
      />

      <View>
        <FlatList<AttendanceItem>
          contentContainerStyle={$contentContainer}
          data={attendanceStore.currentAttendanceRecord?.items}
          ListHeaderComponent={
            <View style={{ marginTop: spacing.medium }}>
              <Text
                style={{
                  textAlign: "left",
                  marginLeft: spacing.tiny,
                  color: colors.ehkamDarkGrey,
                }}
                preset="formLabel"
              >
                معدّلات
              </Text>
              <ModalSelect
                options={statsFilters}
                placeholder={""}
                selectedOpt={statsFilter.label}
                selectedKey={statsFilter.key}
                onChange={setStatsFilter}
                containerStyle={{ flex: 1, marginVertical: spacing.small }}
              />
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.ehkamCyan,
                  borderRadius: spacing.small,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  paddingVertical: spacing.extraSmall,
                  minHeight: 120,
                  alignItems: "center",
                  marginBottom: spacing.medium,
                }}
              >
                <View style={{ alignItems: "center", flex: 0.5 }}>
                  <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
                    الحضور
                  </Text>
                  <View>
                    <Text
                      style={{ color: colors.ehkamCyan, textAlign: "center" }}
                      size="xxl"
                      weight="medium"
                    >
                      {statsFilter.key === 2 ? currentAttendanceRate : attendanceRate}%
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "center", flex: 0.5 }}>
                  <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
                    جلسات
                  </Text>
                  <View>
                    <Text
                      style={{ color: colors.ehkamCyan, textAlign: "center" }}
                      size="xxl"
                      weight="medium"
                    >
                      {statsFilter.key === 2 ? currentSessionsRate : sessionsRate} %
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                weight="book"
                style={{
                  color: colors.ehkamGrey,
                  marginBottom: spacing.small,
                  marginStart: spacing.medium,
                }}
                text="تسجيل الحضور"
              />
            </View>
          }
          renderItem={renderAttendanceItem}
          onRefresh={manualRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator />
            ) : (
              <EmptyState
                preset="generic"
                buttonOnPress={manualRefresh}
                ImageProps={{ resizeMode: "contain" }}
                heading="القائمة فارغة"
                content=""
                button="تحديث القائمة"
                ButtonProps={{ preset: "reversed" }}
                buttonStyle={{
                  backgroundColor: colors.ehkamPeach,
                  borderRadius: 20,
                }}
                imageSource={{}}
              />
            )
          }
        />
      </View>
    </DrawerLayoutScreen>
  )
})

const $contentContainer: ViewStyle = {
  alignContent: "center",
  paddingHorizontal: spacing.large,
  paddingBottom: Dimensions.get("screen").height * 0.2,
}

const AttendanceCard = function AttendanceCard({
  onPress,
  present,
  student,
}: {
  onPress: () => void
  present: boolean
  student: Student
}) {
  return (
    <StudentCard
      student={student}
      onPress={onPress}
      additionalComponent={
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 25,
            justifyContent: "space-around",
            alignItems: "center",
            marginHorizontal: spacing.medium,
            marginTop: spacing.extraSmall,
          }}
        >
          <Toggle
            inputOuterStyle={{
              backgroundColor: colors.background,
              borderRadius: 8,
              borderColor: present ? colors.ehkamPeach : colors.ehkamGrey,
            }}
            inputInnerStyle={{ backgroundColor: colors.background }}
            inputDetailStyle={{
              tintColor: colors.ehkamPeach,
            }}
            containerStyle={{ marginBottom: spacing.small }}
            value={present}
            variant="checkbox"
            onPress={onPress}
          />
        </View>
      }
    />
  )
}
