/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { DrawerLayoutScreen, Icon, NoDrawerLayoutScreen, Text } from "../components"
import { useStores } from "../models"
import { RecordsQueueItem } from "../models/AttendanceStore"
import { SessionQueueItem } from "../models/SessionStore"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

interface SyncScreenProps extends AppStackScreenProps<"Sync"> {}

export const SyncScreen: FC<SyncScreenProps> = observer(function SyncScreen(_props) {
  const navigation = useNavigation()
  const { sessionStore, attendanceStore } = useStores()

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
        <Text
          weight="book"
          style={{ color: colors.ehkamRed, textAlign: "center", marginBottom: spacing.small }}
          size="xxs"
        >
          هذه الجلسات غير مرفوعة ! اضغط لمزامنتها وتحديث البيانات
        </Text>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 0.5,
            borderBottomColor: colors.ehkamGrey,
            marginVertical: spacing.small,
            paddingBottom: spacing.tiny,
          }}
        >
          <Text
            text="سجلات حضور"
            weight="bold"
            size="sm"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
          />
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

        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 0.5,
            borderBottomColor: colors.ehkamGrey,
            marginBottom: spacing.small,
            marginTop: spacing.medium,
            paddingBottom: spacing.tiny,
          }}
        >
          <Text
            text="جلسات تسميع"
            weight="bold"
            size="sm"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
          />
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
              recordType="attendance"
              date={
                item.session.timestamp.substring(0, 10) +
                " الساعة " +
                item.session.timestamp.substring(11, 16)
              }
            />
          ))}
        </View>
      </View>
    </NoDrawerLayoutScreen>
  )
})

export interface ListItemProps {
  date: string
  recordType: "session" | "attendance"
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
        <Text weight="book" size="xs" style={{ color: colors.ehkamGrey }}>
          {props.date}
        </Text>
      </View>
    </View>
  )
}
