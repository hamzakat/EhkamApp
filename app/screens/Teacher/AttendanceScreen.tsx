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
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { colors, spacing } from "../../theme"
import { delay } from "../../utils/delay"
import { AttendanceRecordModel, AttendanceRecord } from "../../models/AttendanceRecord"
import { AttendanceItem, AttendanceItemModel } from "../../models/AttendanceItem"
import { Student } from "../../models/Student"
import { getSnapshot, onSnapshot } from "mobx-state-tree"
import "react-native-get-random-values"

interface AttendanceScreenProps extends TeacherTabScreenProps<"Attendance"> {}

const ONE_DAY = 24 * 60 * 60 * 1000
const today = new Date()

export const AttendanceScreen: FC<AttendanceScreenProps> = observer(function AttendanceScreen() {
  const { attendanceStore, studentStore, sessionStore, currentUserStore, settingStore } =
    useStores()
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

  const loadStores = async () => {
    setIsLoading(true)
    await currentUserStore.fetchCurrentUser()
    await studentStore.fetchStudents()
    await sessionStore.fetchSessions()
    await attendanceStore.fetchAttendanceRecords()
    await settingStore.fetchSchoolSettings()
    __DEV__ && console.log("Loading stores from Attendance Screen")

    setIsLoading(false)
  }

  const manualRefresh = async () => {
    setRefreshing(true)
    __DEV__ && console.log("refreshing...")
    await Promise.all([loadStores(), delay(750)])
    setRefreshing(false)
  }

  // update the rates based on the filters (total, week, month)
  useFocusEffect(
    React.useCallback(() => {
      const updateRates = () => {
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

        const ratesOfSessionOnEveryDay = filteredAttendanceRecords.map(
          (record: AttendanceRecord) => {
            const numOfPresetStudents = record.getNumberOfPresent()
            if (numOfPresetStudents === 0) return 0 // prevent division by zero

            const numOfSessions = sessionStore.getSessionsByDate(new Date(record.timestamp)).length

            let sessionsRate = Math.round((numOfSessions / numOfPresetStudents) * 100)
            if (sessionsRate > 100) sessionsRate = 100
            return sessionsRate
          },
        )

        let _sessionsRate = 0
        if (ratesOfSessionOnEveryDay.length > 0) {
          // sum the rates of sessions on every day and divide by the number of days
          _sessionsRate = Math.round(
            ratesOfSessionOnEveryDay.reduce((a, b) => a + b, 0) / ratesOfSessionOnEveryDay.length,
          )
        }

        setSessionsRate(_sessionsRate)
      }

      loadStores().then(() => updateRates())
      return () => updateRates()
    }, [statsFilter, attendanceStore, sessionStore]),
  )

  const [currentAttendanceRate, setCurrentAttendanceRate] = useState(0)
  const [currentSessionsRate, setCurrentSessionsRate] = useState(0)

  // update the current rates
  useEffect(() => {
    const dispose = onSnapshot(attendanceStore.currentAttendanceRecord?.items, (change) => {
      // update the attendance rate
      setCurrentAttendanceRate(attendanceStore.currentAttendanceRecord.getRate())

      // update the sessions rate
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

  // check if the current record is changed
  useEffect(() => {
    const dispose = onSnapshot(attendanceStore.currentAttendanceRecord?.items, (change) => {
      if (!attendanceStore.currentAttendanceRecordChanged) {
        attendanceStore.setProp("currentAttendanceRecordChanged", true)
        __DEV__ && console.log("currentAttendanceRecordChanged")
      }
    })
    return () => {
      dispose() // Cleanup the observer when the component unmounts
    }
  }, [attendanceStore.currentAttendanceRecord, sessionStore])

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

  // select/unselect all

  const toggleAll = () => {
    const allPresent = attendanceStore.currentAttendanceRecord.items.every(
      (item) => item.present === true,
    )
    if (allPresent) {
      attendanceStore.currentAttendanceRecord.items.forEach((item) =>
        item.setProp("present", false),
      )
    } else {
      attendanceStore.currentAttendanceRecord.items.forEach((item) => item.setProp("present", true))
    }
  }

  const [allIsSelected, setAllIsSelected] = useState(false)

  useEffect(() => {
    const disposer = onSnapshot(attendanceStore.currentAttendanceRecord, (snapshot) => {
      // Trigger your side effect here
      const allPresent = snapshot.items.every((item) => item.present === true)
      setAllIsSelected(allPresent)
    })

    return () => {
      disposer() // Cleanup the observer when the component unmounts
    }
  }, [attendanceStore.currentAttendanceRecord])

  return (
    <DrawerLayoutScreen title="الحضور" navigation={navigation} backBtn={false}>
      <View>
        {attendanceStore.currentAttendanceRecord?.items.length > 0 && (
          <FlatList<AttendanceItem>
            contentContainerStyle={{
              alignContent: "center",
              paddingHorizontal: spacing.large,
              paddingBottom: Dimensions.get("screen").height * 0.2,
            }}
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
                      {isLoading ? (
                        <ActivityIndicator size={"large"} color={colors.ehkamCyan} />
                      ) : (
                        <Text
                          style={{ color: colors.ehkamCyan, textAlign: "center" }}
                          size="xxl"
                          weight="medium"
                        >
                          {statsFilter.key === 2 ? currentAttendanceRate : attendanceRate} %
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{ alignItems: "center", flex: 0.5 }}>
                    <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
                      جلسات
                    </Text>
                    <View>
                      {isLoading ? (
                        <ActivityIndicator size={"large"} color={colors.ehkamCyan} />
                      ) : (
                        <Text
                          style={{ color: colors.ehkamCyan, textAlign: "center" }}
                          size="xxl"
                          weight="medium"
                        >
                          {statsFilter.key === 2 ? currentSessionsRate : sessionsRate} %
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                {/* <Text
                  weight="book"
                  style={{
                    color: colors.ehkamGrey,
                    marginBottom: spacing.small,
                    marginStart: spacing.medium,
                  }}
                  text="تسجيل الحضور"
                /> */}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between", // Aligns children to the start and end of the View
                    marginEnd: spacing.medium, // Adds a gap between the children and the end of the view
                  }}
                >
                  <View>
                    <Text
                      weight="book"
                      style={{
                        color: colors.ehkamGrey,
                        marginBottom: spacing.small,
                        marginStart: spacing.medium,
                      }}
                      text="تحديد الكل"
                    />
                  </View>
                  <Toggle
                    inputOuterStyle={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      borderColor: allIsSelected ? colors.ehkamPeach : colors.ehkamGrey,
                    }}
                    inputInnerStyle={{ backgroundColor: colors.background }}
                    inputDetailStyle={{
                      tintColor: colors.ehkamPeach,
                    }}
                    containerStyle={{ marginBottom: spacing.small }}
                    value={allIsSelected}
                    variant="checkbox"
                    onPress={toggleAll}
                  />
                </View>
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
        )}
      </View>
    </DrawerLayoutScreen>
  )
})

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
