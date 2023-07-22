/* eslint-disable react-native/no-inline-styles */
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { SessionStackScreenProps } from "./SessionStack"
import { Button, Card, DrawerLayoutScreen, Text, Toggle } from "../../../components"
import { View, ScrollView } from "react-native"
import { colors, spacing } from "../../../theme"
import { useStores } from "../../../models"

export const SessionTypeScreen: FC<SessionStackScreenProps<"SessionType">> = observer(
  function SessionTypeScreen({ navigation }) {
    const { sessionStore } = useStores()
    const [sessionType, setSessionType] = useState<"new" | "repeat" | "exam">("new")

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
          <View style={{ marginTop: spacing.huge }}>
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
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: spacing.extraLarge,

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
