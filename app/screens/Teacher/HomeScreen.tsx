/* eslint-disable react-native/no-inline-styles */
import { observer } from "mobx-react-lite"
import React, { FC, ReactElement, useEffect, useState } from "react"
import { Dimensions, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import {
  Button,
  DrawerLayoutScreen,
  ModalSelect,
  Screen,
  Text,
  TwoButtonsDialog,
} from "../../components"
import { isRTL } from "../../i18n"
import { useStores } from "../../models" // @demo remove-current-line
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"
import { colors, spacing } from "../../theme"
import { useHeader } from "../../utils/useHeader" // @demo remove-current-line
import { getSnapshot } from "mobx-state-tree"
import { AttendanceRecord } from "../../models/AttendanceRecord"

import FastImage from "react-native-fast-image"
import Config from "../../config"
import { useNavigation } from "@react-navigation/native"

const ONE_DAY = 24 * 60 * 60 * 1000
const today = new Date()
const avatarPlaceholder = require("../../../assets/images/avatar-placeholder.jpeg")
interface HomeScreenProps extends TeacherTabScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen(_props) {
  const {
    attendanceStore,
    currentUserStore,
    studentStore,
    sessionStore,
    settingStore,
    authenticationStore,
  } = useStores()

  useEffect(() => {
    loadStores()
  }, [studentStore, attendanceStore, sessionStore])

  const navigation = useNavigation()

  const loadStores = () => {
    ;(async function load() {
      await studentStore.fetchStudents()
      await sessionStore.fetchSessions()
      await attendanceStore.fetchAttendanceRecords()
      await settingStore.fetchSchoolSettings()
      __DEV__ && console.log("Loading stores from Home Screen")
    })()
  }

  const exit = async () => {
    const currentAttendanceRecord: AttendanceRecord = attendanceStore.currentAttendanceRecord
    if (currentAttendanceRecord.items.length > 0) {
      // push the old record to the store (if it holds items) AND send the old record to the server
      await attendanceStore.sendAttendanceRecord(getSnapshot(currentAttendanceRecord))
    }
    currentUserStore.setProp("entered", false)
  }
  const [showDialog, setShowDialog] = useState(false)
  // useHeader({
  //   rightText: "إنهاء دوام",
  //   onRightPress: () => setShowDialog(true),
  // })

  const statsFilters = [
    { key: 1, label: "إجمالي" },
    { key: 2, label: "اليوم" },
    { key: 3, label: "الاسبوع" },
    { key: 4, label: "الشهر" },
  ]
  const [statsFilter, setStatsFilter] = useState(statsFilters[0])

  const rankFilters = [
    { key: 1, label: "الأكثر التزاماً" },
    { key: 2, label: "الأقل التزاماً" },
  ]

  const [rankFilter, setRankFilter] = useState(rankFilters[0])

  const attendanceStudents = studentStore.students
    .slice()
    .sort((a: Student, b: Student) => {
      if (rankFilter.key === 1) {
        return b.attendanceDays.rate - a.attendanceDays.rate
      }
      if (rankFilter.key === 2) {
        return a.attendanceDays.rate - b.attendanceDays.rate
      }
    })
    .slice(0, 3)

  const sessionsStudents = studentStore.students
    .slice()
    .sort((a: Student, b: Student) => {
      if (rankFilter.key === 1) {
        return b.recitingRate - a.recitingRate
      }
      if (rankFilter.key === 2) {
        return a.recitingRate.rate - b.recitingRate.rate
      }
    })
    .slice(0, 3)

  const newPages = sessionStore.sessions
    .filter((session) => {
      const sessionDate = new Date(session.timestamp)
      if (statsFilter.key === 1) return true
      if (statsFilter.key === 2) {
        return sessionDate.toDateString() === today.toDateString()
      }
      if (statsFilter.key === 3) {
        return today - sessionDate <= ONE_DAY * 7
      }
      if (statsFilter.key === 4) {
        return today - sessionDate <= ONE_DAY * 30
      }
    })
    .reduce((total, session) => {
      if (session.type === "new") {
        const totalPages = session.end_page - session.start_page + 1
        return total + totalPages
      }
      return total
    }, 0)

  const repeatPages = sessionStore.sessions
    .filter((session) => {
      const sessionDate = new Date(session.timestamp)
      if (statsFilter.key === 1) return true
      if (statsFilter.key === 2) {
        return sessionDate.toDateString() === today.toDateString()
      }
      if (statsFilter.key === 3) {
        return today - sessionDate <= ONE_DAY * 7
      }
      if (statsFilter.key === 4) {
        return today - sessionDate <= ONE_DAY * 30
      }
    })
    .reduce((total, session) => {
      if (session.type === "repeat") {
        const totalPages = session.end_page - session.start_page + 1
        return total + totalPages
      }
      return total
    }, 0)

  return (
    // <Screen
    //   preset="scroll"
    //   safeAreaEdges={["top", "bottom"]}
    //   contentContainerStyle={{
    //     paddingHorizontal: spacing.large,
    //     paddingBottom: 80,
    //   }}
    // >
    <DrawerLayoutScreen
      title=""
      navigation={navigation}
      element={
        <View>
          <Text
            onPress={() => setShowDialog(true)}
            size="sm"
            weight="book"
            style={{ color: colors.ehkamPeach, marginRight: spacing.medium }}
          >
            إنهاء الدوام
          </Text>
        </View>
      }
      ScreenProps={{
        contentContainerStyle: {
          paddingHorizontal: spacing.large,
          paddingBottom: Dimensions.get("screen").height * 0.2,
          marginTop: spacing.medium,
        },
        preset: "scroll",
        safeAreaEdges: ["bottom"],
      }}
    >
      <TwoButtonsDialog
        text="⌚ هل أنت متأكد من انتهاء فترة الدوام؟"
        cyanButtonText="نعم"
        peachButtonText="لا"
        cyanButtonFn={exit}
        visible={showDialog}
        peachButtonFn={() => setShowDialog(false)}
        cancel={() => setShowDialog(false)}
      />
      <View
        style={{
          justifyContent: "center",

          marginBottom: spacing.small,
        }}
      >
        <Text preset="heading" style={{ color: colors.ehkamDarkGrey }}>
          احصائيات
        </Text>
      </View>
      <ModalSelect
        options={statsFilters}
        placeholder={""}
        selectedOpt={statsFilter.label}
        selectedKey={statsFilter.key}
        onChange={setStatsFilter}
        containerStyle={{ flex: 1, marginBottom: spacing.small }}
      />

      <View>
        <Text
          style={{
            textAlign: "left",
            marginLeft: spacing.tiny,
            color: colors.ehkamDarkGrey,
            marginTop: spacing.small,
          }}
          preset="formLabel"
        >
          عدد الصفحات
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.ehkamCyan,
            borderRadius: spacing.small,
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: spacing.small,
            minHeight: 120,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
              المسمّعة
            </Text>
            <View>
              <Text
                style={{ color: colors.ehkamCyan, textAlign: "center" }}
                size="xxl"
                weight="medium"
              >
                {newPages}
              </Text>
              <Text
                style={{ color: colors.ehkamCyan, textAlign: "center" }}
                size="sm"
                weight="light"
              >
                صفحة
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
              المراجعة
            </Text>
            <View>
              <Text
                style={{ color: colors.ehkamCyan, textAlign: "center" }}
                size="xxl"
                weight="medium"
              >
                {repeatPages}
              </Text>
              <Text
                style={{ color: colors.ehkamCyan, textAlign: "center" }}
                size="sm"
                weight="light"
              >
                صفحة
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View>
        <Text
          style={{
            textAlign: "left",
            marginLeft: spacing.tiny,
            color: colors.ehkamDarkGrey,
            marginTop: spacing.small,
          }}
          preset="formLabel"
        >
          معدّلات
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.ehkamCyan,
            borderRadius: spacing.small,
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: spacing.small,
            minHeight: 120,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
              الحضور
            </Text>
            <View>
              <Text
                style={{ color: colors.ehkamCyan, textAlign: "center" }}
                size="xxl"
                weight="medium"
              >
                85%
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.ehkamDarkGrey }} size="lg" weight="book">
              جلسات
            </Text>
            <View>
              <Text
                style={{ color: colors.ehkamCyan, textAlign: "center" }}
                size="xxl"
                weight="medium"
              >
                89%
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          justifyContent: "center",
          marginTop: spacing.large,
          marginBottom: spacing.small,
        }}
      >
        <Text preset="heading" style={{ color: colors.ehkamDarkGrey }}>
          ترتيب الطلاب
        </Text>
      </View>
      <ModalSelect
        options={rankFilters}
        placeholder={""}
        selectedOpt={rankFilter.label}
        selectedKey={rankFilter.key}
        onChange={setRankFilter}
        containerStyle={{ flex: 1, marginBottom: spacing.small }}
      />
      <View>
        <Text
          style={{
            textAlign: "left",
            marginLeft: spacing.tiny,
            color: colors.ehkamDarkGrey,
            marginTop: spacing.small,
          }}
          preset="formLabel"
        >
          الالتزام بالحضور
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.ehkamCyan,
            borderRadius: spacing.small,
            justifyContent: "space-around",
            // paddingVertical: spacing.small,
            // minHeight: 120,
          }}
        >
          {attendanceStudents.map((student, i) => (
            <View
              style={{
                flexDirection: "row",
                minHeight: 60,
                borderBottomWidth: i !== attendanceStudents.length - 1 ? 1 : 0,
                borderBottomColor: colors.ehkamGrey,
                paddingLeft: spacing.small,
                alignItems: "center",
              }}
              key={i}
            >
              <FastImage
                style={{
                  borderRadius: (50 + 50) / 2,
                  width: 50,
                  height: 50,
                }}
                defaultSource={require("../../../assets/images/avatar-placeholder.jpeg")}
                source={{
                  uri: `${Config.API_URL}/assets/${student.avatar}?width=50&height=50&quality=100`,
                  headers: { Authorization: `Bearer ${authenticationStore.accessToken}` },
                  priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.contain}
                onError={() => __DEV__ && console.log("NOIMAGE")}
              />
              <Text
                style={{ marginLeft: spacing.small, color: colors.ehkamCyan }}
                size="lg"
                weight="medium"
              >
                {student.fullname}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text
          style={{
            textAlign: "left",
            marginLeft: spacing.tiny,
            color: colors.ehkamDarkGrey,
            marginTop: spacing.small,
          }}
          preset="formLabel"
        >
          إنجاز التسميع
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.ehkamCyan,
            borderRadius: spacing.small,
            justifyContent: "space-around",
            // paddingVertical: spacing.small,
            // minHeight: 120,
          }}
        >
          {sessionsStudents.map((student, i) => (
            <View
              style={{
                flexDirection: "row",
                minHeight: 60,
                borderBottomWidth: i !== sessionsStudents.length - 1 ? 1 : 0,
                borderBottomColor: colors.ehkamGrey,
                paddingLeft: spacing.small,
                alignItems: "center",
              }}
              key={i}
            >
              <FastImage
                style={{
                  borderRadius: (50 + 50) / 2,
                  width: 50,
                  height: 50,
                }}
                defaultSource={avatarPlaceholder}
                source={{
                  uri: `${Config.API_URL}/assets/${student.avatar}?width=50&height=50&quality=100`,
                  headers: { Authorization: `Bearer ${authenticationStore.accessToken}` },
                  priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.contain}
                onError={() => __DEV__ && console.log("NOIMAGE")}
              />
              <Text
                style={{ marginLeft: spacing.small, color: colors.ehkamCyan }}
                size="lg"
                weight="medium"
              >
                {student.fullname}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </DrawerLayoutScreen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  justifyContent: "center",
  paddingHorizontal: spacing.large,
  alignContent: "center",
}

const $bottomContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.large,
  justifyContent: "space-around",
}

const $welcomeHeading: TextStyle = {
  marginBottom: spacing.medium,
}
