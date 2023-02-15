/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { View, ToastAndroid, ActivityIndicator } from "react-native"
import { Button, Icon, NoDrawerLayoutScreen, Text } from "../components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { useNetInfo } from "@react-native-community/netinfo"
import { delay } from "../utils/delay"

interface SyncScreenProps extends AppStackScreenProps<"Sync"> {}

export const SyncScreen: FC<SyncScreenProps> = observer(function SyncScreen(_props) {
  const navigation = useNavigation()
  const { sessionStore, attendanceStore } = useStores()
  const netInfo = useNetInfo()

  const [sending, setSending] = useState(false)

  const sendAttendanceItems = async () => {
    if (netInfo.isInternetReachable) {
      setSending(true)
      await Promise.all([attendanceStore.dequeue(), delay(12000)])
      setSending(false)
    } else {
      ToastAndroid.show("غير متصّل بالانترنت", ToastAndroid.SHORT)
    }
  }
  const sendSessionItems = async () => {
    if (netInfo.isInternetReachable) {
      setSending(true)
      await Promise.all([sessionStore.dequeue(), delay(12000)])
      setSending(false)
    } else {
      ToastAndroid.show("غير متصّل بالانترنت", ToastAndroid.SHORT)
    }
  }
  return (
    <NoDrawerLayoutScreen
      Icon={<Icon icon="sync" containerStyle={{ marginHorizontal: spacing.medium }} />}
      title="مزامنة السجلات"
      backBtn={true}
      navigation={navigation}
      preset="scroll"
    >
      <View
        style={{
          alignContent: "center",
          paddingHorizontal: spacing.small,
          paddingBottom: spacing.large,
        }}
      >
        {sending ? (
          <ActivityIndicator size="large" color={colors.ehkamCyan} />
        ) : (
          <>
            {attendanceStore.recordsOfflineQueue.length > 0 ||
            sessionStore.sessionOfflineQueue.length > 0 ? (
              <>
                <Text
                  weight="semiBold"
                  style={{
                    color: colors.ehkamRed,
                    textAlign: "center",
                    marginBottom: spacing.small,
                  }}
                  size="xxs"
                >
                  هذه السجلّات غير مرفوعة ! اضغط على زر الرّفع {"\n"}
                </Text>
              </>
            ) : (
              <>
                <Text
                  weight="semiBold"
                  style={{
                    color: colors.ehkamCyan,
                    textAlign: "center",
                    marginBottom: spacing.small,
                  }}
                  size="xs"
                >
                  لا يوجد سجلّات تحتاج للرفع{"\n"}
                </Text>
              </>
            )}

            {attendanceStore.recordsOfflineQueue.length > 0 && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.ehkamGrey,
                    marginVertical: spacing.small,
                    paddingBottom: spacing.tiny,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    text="سجلات حضور"
                    weight="bold"
                    size="sm"
                    style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
                  />
                  <Text
                    weight="bold"
                    size="sm"
                    style={{
                      borderWidth: 1.3,
                      borderColor: colors.ehkamCyan,
                      borderRadius: 10,
                      paddingVertical: spacing.tiny,
                      paddingHorizontal: spacing.small,
                      marginEnd: spacing.small,
                      color: colors.ehkamCyan,
                    }}
                    onPress={sendAttendanceItems}
                  >
                    رفع
                  </Text>
                </View>

                <View
                  style={{
                    alignContent: "center",
                    paddingHorizontal: spacing.small,
                    paddingBottom: spacing.large,
                    paddingTop: spacing.tiny,
                  }}
                >
                  {attendanceStore.recordsOfflineQueue.map((item, i) => (
                    <ListItem
                      key={i}
                      recordType="attendance"
                      date={
                        item.attendanceRecord.timestamp.substring(0, 10) +
                        " الساعة " +
                        item.attendanceRecord.timestamp.substring(11, 16)
                      }
                    />
                  ))}
                </View>
              </>
            )}
            {sessionStore.sessionOfflineQueue.length > 0 && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.ehkamGrey,
                    marginBottom: spacing.small,
                    marginTop: spacing.medium,
                    paddingBottom: spacing.tiny,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    text="جلسات تسميع"
                    weight="bold"
                    size="sm"
                    style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
                  />
                  <Text
                    weight="bold"
                    size="sm"
                    style={{
                      borderWidth: 1.3,
                      borderColor: colors.ehkamCyan,
                      borderRadius: 10,
                      paddingVertical: spacing.tiny,
                      paddingHorizontal: spacing.small,
                      marginEnd: spacing.small,
                      color: colors.ehkamCyan,
                    }}
                    onPress={sendSessionItems}
                  >
                    رفع
                  </Text>
                </View>

                <View
                  style={{
                    alignContent: "center",
                    paddingHorizontal: spacing.small,
                    paddingBottom: spacing.large,
                    paddingTop: spacing.tiny,
                  }}
                >
                  {sessionStore.sessionOfflineQueue.map((item, i) => (
                    <ListItem
                      key={i}
                      recordType="session"
                      date={
                        item.session.timestamp.substring(0, 10) +
                        " الساعة " +
                        item.session.timestamp.substring(11, 16)
                      }
                      studentName={item.session.studentName}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </View>
    </NoDrawerLayoutScreen>
  )
})

export interface ListItemProps {
  date: string
  recordType: "session" | "attendance"
  studentName?: string
  onTouchEnd?: () => void
}

const ListItem = (props: ListItemProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 12,
        marginBottom: spacing.small,

        paddingVertical: spacing.extraSmall,
        alignItems: "center",
        backgroundColor: colors.background,

        shadowColor: colors.palette.neutral800,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 0.7,
      }}
      onTouchEnd={props.onTouchEnd}
    >
      <View
        style={{
          marginHorizontal: spacing.small,
          backgroundColor: colors.ehkamRed,
          borderRadius: 25,
          width: 28,
          height: 28,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon icon="outbox" color={colors.background} size={14} />
      </View>
      <View style={{ flex: 1, margin: spacing.small }}>
        {/* <Text weight="book" size="xs" style={{ color: colors.ehkamGrey }}>
          نوع السجل: {props.recordType === "session" ? "جلسة" : "حضور"}
        </Text> */}
        {props.recordType === "session" && (
          <Text weight="book" size="xs" style={{ color: colors.ehkamGrey }}>
            اسم الطالب: {props.studentName}
          </Text>
        )}

        <Text weight="book" size="xs" style={{ color: colors.ehkamGrey }}>
          {props.date}
        </Text>
      </View>
    </View>
  )
}
