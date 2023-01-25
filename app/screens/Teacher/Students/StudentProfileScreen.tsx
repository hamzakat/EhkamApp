/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { AutoImage, Button, DrawerLayoutScreen, Icon, Text } from "../../../components"
import { StudentStackScreenProps } from "./StudentStack"
import { useStores } from "../../../models"
import { Student } from "../../../models/Student"
import { FlatList, ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { colors, spacing } from "../../../theme"
import { getChapterTitle } from "../../../utils/quranInfo"
import { UserModel } from "../../../models/User"
import FastImage from "react-native-fast-image"
import Config from "../../../config"

export const StudentProfileScreen: FC<StudentStackScreenProps<"StudentProfile">> = observer(
  function StudentProfileScreen({ navigation, route }) {
    const headerImg = require("../../../../assets/images/student-profile-header.png")

    const studentId = route.params.studentId
    const { studentStore, authenticationStore, sessionStore, attendanceStore } = useStores()
    const currentStudent: Student = studentStore.students.find(
      (student: Student) => student.id === studentId,
    )
    const studentAttendanceDays = currentStudent.attendanceDays
    const lastNewSession = currentStudent.lastNewSession
    const lastRepeatSession = currentStudent.lastRepeatSession

    const imgUrl = `${Config.API_URL}/assets/${currentStudent.avatar}?width=200&height=200&quality=80`
    const [selectedTab, setSelectedTab] = useState<"personal" | "attendance" | "educational">(
      "personal",
    )
    const [showAttendanceRecords, setShowAttendanceRecords] = useState(false)

    useEffect(() => {
      loadStores()
    }, [studentStore, attendanceStore, sessionStore])

    const loadStores = () => {
      ;(async function load() {
        await studentStore.fetchStudents()
        await sessionStore.fetchSessions()
        await attendanceStore.fetchAttendanceRecords()
        __DEV__ && console.log("Loading stores from Student Profile Screen")
      })()
    }
    return (
      <DrawerLayoutScreen backBtn={true} navigation={navigation} title={""} transparent={true}>
        <View
          style={{
            justifyContent: "space-around",
            marginBottom: spacing.large,
          }}
        >
          <View>
            <AutoImage
              source={headerImg}
              style={{
                alignSelf: "center",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                width: "100%",
                height: 200,
              }}
              resizeMethod="auto"
              resizeMode="cover"
            />
          </View>
          <View>
            {/* <AutoImage
              source={studentImg}
              style={{
                position: "absolute",
                borderRadius: 100,
                width: 152,
                height: 152,
                left: 120,
                top: -100,
              }}
            /> */}
            <FastImage
              style={{
                position: "absolute",
                borderRadius: 100,
                width: 152,
                height: 152,
                left: 120,
                top: -100,
              }}
              source={{
                uri: imgUrl,
                headers: { Authorization: `Bearer ${authenticationStore.accessToken}` },
                priority: FastImage.priority.high,
              }}
              resizeMode={FastImage.resizeMode.contain}
              onError={() => console.log("NOIMAGE")}
            />
          </View>
          {/* Delete Button + Name + ID */}
          <View
            style={{
              flexDirection: "row",
              marginTop: spacing.massive,
              alignContent: "center",
              paddingHorizontal: spacing.large,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                backgroundColor: colors.ehkamPeach,
                width: 33,
                height: 33,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                paddingVertical: spacing.tiny,
                marginHorizontal: spacing.small,
              }}
            >
              <Text
                weight="bold"
                style={{
                  color: colors.background,
                  paddingTop: spacing.tiny,
                }}
                size="xs"
              >
                013
              </Text>
            </View>
            <Text
              size="xl"
              weight="bold"
              style={{
                color: colors.ehkamGrey,
                textAlignVertical: "center",
                marginTop: spacing.tiny,
              }}
            >
              {currentStudent.fullname}
            </Text>
            <View style={{ alignSelf: "center" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.ehkamRed,
                  width: 36,
                  height: 36,
                  borderRadius: spacing.extraSmall,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                // onPress={}
              >
                <Icon icon="trash" color={colors.background} size={spacing.large} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Tab Switch */}
          <View
            style={{
              flexDirection: "row",
              marginTop: spacing.small,
              alignContent: "center",
              paddingHorizontal: spacing.large,
              justifyContent: "space-between",
            }}
          >
            <Text
              weight="bold"
              size="xs"
              text="المستوى العلمي"
              style={{
                paddingBottom: spacing.micro,
                borderBottomWidth: 2,
                borderBottomColor: colors.ehkamCyan,
                color: colors.ehkamCyan,
                opacity: selectedTab !== "educational" ? 0.35 : 1,
              }}
              onPress={() => setSelectedTab("educational")}
            />
            <Text
              weight="bold"
              size="xs"
              text="الحضور والسلوك"
              style={{
                paddingBottom: spacing.micro,
                borderBottomWidth: 2,
                borderBottomColor: colors.ehkamCyan,
                color: colors.ehkamCyan,
                opacity: selectedTab !== "attendance" ? 0.35 : 1,
              }}
              onPress={() => setSelectedTab("attendance")}
            />
            <Text
              weight="bold"
              size="xs"
              text="بيانات الطالب"
              style={{
                paddingHorizontal: spacing.small,
                paddingBottom: spacing.micro,
                borderBottomWidth: 2,
                borderBottomColor: colors.ehkamCyan,
                color: colors.ehkamCyan,
                opacity: selectedTab !== "personal" ? 0.35 : 1,
              }}
              onPress={() => setSelectedTab("personal")}
            />
          </View>

          {/* Items, based on the selected tab  */}
          <ScrollView
            contentContainerStyle={{
              marginTop: spacing.small,
              paddingHorizontal: spacing.large,
              marginBottom: spacing.massive,
              paddingBottom: spacing.large,
            }}
          >
            {/* بيانات الطالب */}
            {selectedTab === "personal" && (
              <>
                <InfoGridRow info={currentStudent.age} label="العمر" />
                <InfoGridRow info={currentStudent.s_edu_grade} label="الصف" />
                <InfoGridRow info={currentStudent.s_edu_school} label="المدرسة" />
                <InfoGridRow info={currentStudent.city} label="المحافظة" />
                <InfoGridRow info={currentStudent.location} label="السكن" />
                <InfoGridRow info={currentStudent.s_blood} label="زمرة الدم" />
                <InfoGridRow info={currentStudent.s_health_issues} label="ملاحظات صحية" />
                <InfoGridRow info={currentStudent.s_parent_job} label="مهنة الوالد" />
                <InfoGridRow info={currentStudent.s_social_issues} label="ملاحظات اجتماعية" />
              </>
            )}

            {/* الحضور والسلوك */}
            {selectedTab === "attendance" && (
              <>
                {showAttendanceRecords ? (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: spacing.small,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Icon
                          icon="checked"
                          size={spacing.medium}
                          style={{ marginEnd: spacing.extraSmall }}
                        />
                        <Text weight="book" style={{ color: colors.ehkamDarkGrey }}>
                          سجل الحضور
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          weight="book"
                          size="xs"
                          style={{ color: colors.ehkamPeach }}
                          onPress={() => setShowAttendanceRecords(false)}
                        >
                          رجوع
                        </Text>
                        <Icon
                          icon="leftArrow"
                          size={spacing.small}
                          color={colors.ehkamPeach}
                          style={{ marginStart: spacing.extraSmall }}
                          onPress={() => setShowAttendanceRecords(false)}
                        />
                      </View>
                    </View>
                    {currentStudent.attendanceRecords.map((item, i) => (
                      <InfoGridRow
                        key={i}
                        info={item.timestamp}
                        label={item.present ? "حاضر" : "عائب"}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: spacing.small,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Icon
                          icon="checked"
                          size={spacing.medium}
                          style={{ marginEnd: spacing.extraSmall }}
                        />
                        <Text weight="book" style={{ color: colors.ehkamDarkGrey }}>
                          بيانات الدوام
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          weight="book"
                          size="xs"
                          style={{ color: colors.ehkamPeach }}
                          onPress={() => setShowAttendanceRecords(true)}
                        >
                          عرض سجل الحضور
                        </Text>
                        <Icon
                          icon="leftArrow"
                          size={spacing.small}
                          color={colors.ehkamPeach}
                          style={{ marginStart: spacing.extraSmall }}
                          onPress={() => setShowAttendanceRecords(true)}
                        />
                      </View>
                    </View>
                    <InfoGridRow
                      info={currentStudent.date_created.substring(0, 10)}
                      label="تاريخ التسجيل"
                    />
                    <InfoGridRow
                      info={studentAttendanceDays.daysPresent.toString()}
                      label="عدد أيام الدوام"
                    />
                    <InfoGridRow
                      info={studentAttendanceDays.daysAbsent.toString()}
                      label="عدد أيام الغياب"
                    />
                    <InfoGridRow
                      info={studentAttendanceDays.rate.toString() + "%"}
                      label="معدل الدوام"
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: spacing.small,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Icon
                          icon="records"
                          size={spacing.medium}
                          style={{ marginEnd: spacing.extraSmall }}
                        />
                        <Text weight="book" style={{ color: colors.ehkamDarkGrey }}>
                          سجل ملاحظات السلوك
                        </Text>
                      </View>
                    </View>
                    <InfoGridRow info="الملاحظة" label="التاريخ" />
                    <InfoGridRow info="المشاركة في المراجعة لأصدقائه" label="31/5/2022" />

                    <AddButton text="إضافة ملاحظة سلوكية" />
                  </>
                )}
              </>
            )}

            {/* المستوى التعليمي */}
            {selectedTab === "educational" && (
              <>
                <InfoGridRow
                  info="لايوجد"
                  label="المحفوظ السابق"
                  labelFlexValue={0.4}
                  infoFlexValue={0.6}
                />
                <InfoGridRow
                  info={"5" + " أجزاء"}
                  label="المحفوظ حالياً"
                  labelFlexValue={0.4}
                  infoFlexValue={0.6}
                />
                <View style={{ flexDirection: "row", marginBottom: spacing.tiny }}>
                  <View style={{ flex: 0.4, marginEnd: spacing.tiny }}>
                    <InfoGridItem text="آخر جلسة تسميع" bold={true} />
                  </View>
                  <View style={{ flex: 0.6, flexDirection: "row" }}>
                    <View style={{ flex: 1, marginEnd: spacing.tiny }}>
                      <InfoGridItem
                        text={
                          lastNewSession
                            ? lastNewSession?.end_page > lastNewSession?.start_page
                              ? (lastNewSession.end_page - lastNewSession.start_page).toString() +
                                " صفحة"
                              : lastNewSession?.start_page.toString() + " صفحات"
                            : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InfoGridItem text={getChapterTitle(lastNewSession?.end_chapter)} />
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: "row", marginBottom: spacing.tiny }}>
                  <View style={{ flex: 0.4, marginEnd: spacing.tiny }}>
                    <InfoGridItem text="آخر جلسة مراجعة" bold={true} />
                  </View>
                  <View style={{ flex: 0.6, flexDirection: "row" }}>
                    <View style={{ flex: 1, marginEnd: spacing.tiny }}>
                      <InfoGridItem
                        text={
                          lastRepeatSession
                            ? lastRepeatSession?.end_page > lastRepeatSession?.start_page
                              ? (
                                  lastRepeatSession.end_page - lastRepeatSession.start_page
                                ).toString() + " صفحة"
                              : lastRepeatSession?.start_page.toString() + " صفحات"
                            : undefined
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <InfoGridItem text={getChapterTitle(lastRepeatSession?.end_chapter)} />
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </DrawerLayoutScreen>
    )
  },
)

const InfoGridItem = (props: { text: string; bold?: boolean }) => {
  return (
    <View style={{ alignSelf: "stretch" }}>
      <Text
        style={{
          borderWidth: 1,
          borderColor: colors.ehkamDarkGrey,
          borderRadius: spacing.extraSmall,
          textAlign: "center",
          textAlignVertical: "center",
          color: colors.ehkamDarkGrey,
          paddingVertical: spacing.micro,
        }}
        weight={props.bold ? "bold" : "book"}
      >
        {props.text || "لايوجد"}
      </Text>
    </View>
  )
}

const InfoGridRow = (props: {
  info: string
  label: string
  labelFlexValue?: number
  infoFlexValue?: number
}) => {
  return (
    <View style={{ flexDirection: "row", marginBottom: spacing.tiny }}>
      <View style={{ flex: props.labelFlexValue || 1, marginEnd: spacing.tiny }}>
        <InfoGridItem text={props.label} bold={true} />
      </View>
      <View style={{ flex: props.infoFlexValue || 2 }}>
        <InfoGridItem text={props.info} />
      </View>
    </View>
  )
}
const AddButton = (props: { text: string }) => {
  return (
    <View style={{ alignSelf: "stretch" }}>
      <Text
        style={{
          borderRadius: spacing.extraSmall,
          textAlign: "center",
          textAlignVertical: "center",
          color: colors.background,
          backgroundColor: colors.ehkamPeach,
          paddingVertical: spacing.micro,
        }}
        weight={"book"}
      >
        + {props.text}
      </Text>
    </View>
  )
}
