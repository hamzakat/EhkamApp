/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { Observer, observer } from "mobx-react-lite"
import { ActivityIndicator, FlatList, View, ViewStyle } from "react-native"
import { DrawerLayoutScreen, EmptyState, StudentCard, Toggle } from "../../components"
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { colors, spacing } from "../../theme"
import { delay } from "../../utils/delay"
import { AttendanceRecordModel, AttendanceRecord } from "../../models/AttendanceRecord"
import { AttendanceItem, AttendanceItemModel } from "../../models/AttendanceItem"
import { Student } from "../../models/Student"
import { getSnapshot } from "mobx-state-tree"
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"

interface AttendanceScreenProps extends TeacherTabScreenProps<"Attendance"> {}

export const AttendanceScreen: FC<AttendanceScreenProps> = observer(function AttendanceScreen() {
  const { attendanceStore, studentStore } = useStores()
  const navigation = useNavigation()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await studentStore.fetchStudents()
      setIsLoading(false)
    })()
  }, [studentStore])

  useEffect(() => {
    // check today's date
    const timestamp = new Date().toISOString()
    const todayDate = timestamp.substring(0, 10) // yyyy-mm-dd

    // TODO: fetch attendance records from the server and update the store
    //
    // ;(async function load() {
    //   setIsLoading(true)
    //   await attendanceStore.fetchAttendanceRecords()
    //   setIsLoading(false)
    // })()

    const currentAttendanceRecord: AttendanceRecord = attendanceStore.currentAttendanceRecord

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!currentAttendanceRecord) {
      // check if it's a new day
      if (currentAttendanceRecord?.timestamp.substring(0, 10) !== todayDate) {
        __DEV__ && console.log("NEW DAY")
        if (currentAttendanceRecord.items.length > 0) {
          // push the old record to the store (if it holds items) AND send the old record to the server
          attendanceStore.sendAttendanceRecord(getSnapshot(currentAttendanceRecord))
        }

        // create a new empty record on new day
        createNewAttendanceRecord(timestamp)
      }
    } else {
      __DEV__ && console.log("FRESH APP LAUNCH")

      // create a new empty record on a fresh app start
      createNewAttendanceRecord(timestamp)
    }
  }, [attendanceStore])

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

  return (
    <DrawerLayoutScreen title="الحضور" navigation={navigation} backBtn={false}>
      <View>
        <FlatList<AttendanceItem>
          contentContainerStyle={$contentContainer}
          data={attendanceStore.currentAttendanceRecord?.items}
          renderItem={renderAttendanceItem}
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
  paddingBottom: spacing.large,
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
