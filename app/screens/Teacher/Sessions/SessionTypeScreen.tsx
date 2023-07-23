/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { SessionStackScreenProps } from "./SessionStack"
import { Button, Card, DrawerLayoutScreen, ModalSelect, Text, Toggle } from "../../../components"
import { View, ScrollView } from "react-native"
import { colors, spacing } from "../../../theme"
import { useStores } from "../../../models"

const ONE_DAY = 24 * 60 * 60 * 1000
const today = new Date()

export const SessionTypeScreen: FC<SessionStackScreenProps<"SessionType">> = observer(
  function SessionTypeScreen({ navigation }) {
    const { sessionStore, studentStore, attendanceStore, settingStore } = useStores()

    const loadStores = () => {
      ;(async function load() {
        await studentStore.fetchStudents()
        await sessionStore.fetchSessions()
        await attendanceStore.fetchAttendanceRecords()
        await settingStore.fetchSchoolSettings()
        __DEV__ && console.log("Loading stores from Session Type Screen")
      })()
    }
    useEffect(() => {
      loadStores()
    }, [studentStore, attendanceStore, sessionStore])

    const [sessionType, setSessionType] = useState<"new" | "repeat" | "exam">("new")
    const statsFilters = [
      { key: 1, label: "إجمالي" },
      { key: 2, label: "اليوم" },
      { key: 3, label: "الاسبوع" },
      { key: 4, label: "الشهر" },
    ]
    const [statsFilter, setStatsFilter] = useState(statsFilters[0])

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
      <DrawerLayoutScreen title="جلسة جديدة" backBtn={false} navigation={navigation}>
        <ScrollView
          contentContainerStyle={{
            alignContent: "center",
            paddingHorizontal: spacing.large,
            paddingBottom: spacing.massive,
          }}
        >
          {/* {sessionStore.selectedStudent && (
            <StudentCard preset="selected" student={sessionStore.selectedStudent} />
          )} */}

          <View style={{ marginTop: spacing.medium }}>
            <Text
              style={{
                textAlign: "left",
                marginLeft: spacing.tiny,
                color: colors.ehkamDarkGrey,
              }}
              preset="formLabel"
            >
              عدد الصفحات
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
                marginBottom: spacing.medium,
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
          <Text
            weight="book"
            style={{
              color: colors.ehkamGrey,
              marginBottom: spacing.small,
              marginStart: spacing.medium,
            }}
            text="اختر نوع الجلسة"
          />
          <Card
            HeadingComponent={
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: spacing.large,
                }}
              >
                <Text
                  text="جلسة تسميع مقرر جديد"
                  weight="semiBold"
                  size="lg"
                  style={{ color: colors.background }}
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

                    borderColor: colors.background,
                    backgroundColor: colors.ehkamCyan,
                  }}
                  inputInnerStyle={{
                    backgroundColor: colors.ehkamCyan,
                  }}
                  inputDetailStyle={{
                    backgroundColor: colors.background,
                    width: 9,
                    height: 9,
                    borderRadius: 25,
                  }}
                  value={sessionType === "new"}
                />
              </View>
            }
            style={{
              backgroundColor: colors.ehkamCyan,
              marginBottom: spacing.small,
              shadowColor: colors.background,
            }}
            onPress={() => setSessionType("new")}
          />
          <Card
            HeadingComponent={
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: spacing.large,
                }}
              >
                <Text
                  text="جلسة مراجعة المحفوظات"
                  weight="semiBold"
                  size="lg"
                  style={{ color: colors.background }}
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

                    borderColor: colors.background,
                    backgroundColor: colors.ehkamCyan,
                  }}
                  inputInnerStyle={{
                    backgroundColor: colors.ehkamCyan,
                  }}
                  inputDetailStyle={{
                    backgroundColor: colors.background,
                    width: 9,
                    height: 9,
                    borderRadius: 25,
                  }}
                  value={sessionType === "repeat"}
                />
              </View>
            }
            style={{
              backgroundColor: colors.ehkamCyan,
              marginBottom: spacing.small,
              shadowColor: colors.background,
            }}
            onPress={() => setSessionType("repeat")}
          />
          <Card
            HeadingComponent={
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: spacing.large,
                }}
              >
                <Text
                  text="جلسة اختبار حفظ الطالب"
                  weight="semiBold"
                  size="lg"
                  style={{ color: colors.background }}
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

                    borderColor: colors.background,
                    backgroundColor: colors.ehkamCyan,
                  }}
                  inputInnerStyle={{
                    backgroundColor: colors.ehkamCyan,
                  }}
                  inputDetailStyle={{
                    backgroundColor: colors.background,
                    width: 9,
                    height: 9,
                    borderRadius: 25,
                  }}
                  value={sessionType === "exam"}
                />
              </View>
            }
            style={{
              backgroundColor: colors.ehkamCyan,
              marginBottom: spacing.small,
              shadowColor: colors.background,
            }}
            onPress={() => setSessionType("exam")}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: spacing.medium,

              marginBottom: spacing.large,
            }}
          >
            <Button
              style={{
                flex: 0.4,
                backgroundColor: colors.ehkamPeach,
                borderWidth: 0,
                borderRadius: 9,
              }}
              onPress={() => {
                sessionStore.setProp("selectedSessionType", sessionType)
                navigation.navigate("SelectStudent")
              }}
            >
              <Text text="متابعة" weight="bold" size="md" style={{ color: colors.background }} />
            </Button>
          </View>
        </ScrollView>
      </DrawerLayoutScreen>
    )
  },
)
