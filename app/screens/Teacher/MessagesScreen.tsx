/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../../navigators"
import { Button, DrawerLayoutScreen, Icon, Screen, Text, WarningDialog } from "../../components"
import { colors, spacing } from "../../theme"
import FastImage from "react-native-fast-image"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Messages: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Messages" component={MessagesScreen} />`
// Hint: Look for the 🔥!

interface MessagesScreenProps extends TeacherTabScreenProps<"Messages"> {}

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const MessagesScreen: FC<MessagesScreenProps> = observer(function MessagesScreen(_props) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()
  const [shown, setShown] = useState(true)

  // print in the console when this screen is opened

  useFocusEffect(() => {
    console.log("Messages Screen Opened")
    setShown(true)
  })

  return (
    <DrawerLayoutScreen
      title="المراسلات"
      ScreenProps={{
        contentContainerStyle: { paddingHorizontal: spacing.medium, paddingTop: spacing.tiny },
      }}
    >
      <WarningDialog
        text="ميزة المراسلات غير مفعلة بعد. سنخبركم عندمت يتم إطلاقها"
        visible={shown}
        buttonText="رجوع"
        preset="peach"
        cancel={() => {
          setShown(false)
          navigation.navigate("Attendance")
        }}
      />

      {/* // create an overlay dialog with a 50% opacity background.
      // the dialog will be centered in the screen */}

      {/* <View
        style={{
          backgroundColor: colors.background,
          opacity: 0.9,
          borderRadius: 12,
          marginBottom: spacing.small,
          paddingVertical: spacing.extraSmall,
          alignItems: "center",
          shadowColor: colors.palette.neutral800,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,

          elevation: 0.7,
        }}
      >
        <View style={{ minHeight: 120 }}>
          <Icon
            icon="x"
            style={{ position: "absolute", top: -12, right: -12, alignSelf: "flex-end" }}
            color={colors.background}
            onPress={() => navigation.navigate("Attendance")}
          />

          <Text
            weight="medium"
            text={"ميزة المراسلات غير مفعلة بعد. سنخبركم عندمت يتم إطلاقها"}
            style={{ color: colors.background, textAlign: "center", marginTop: spacing.medium }}
            size="sm"
          />
          <Button
            text={" رجوع"}
            textStyle={{ color: colors.ehkamPeach }}
            style={{
              flex: 1,
              borderWidth: 0,
              borderRadius: spacing.small,
              backgroundColor: colors.background,
              // width: 75,
              marginTop: spacing.medium,
              alignSelf: "center",
            }}
            onPress={() => navigation.navigate("Attendance")}
          />
        </View>
      </View> */}

      <View
        style={{
          flexDirection: "row",
          paddingVertical: spacing.small,
          justifyContent: "flex-start",
        }}
      >
        <View>
          <FastImage
            style={{
              borderRadius: (50 + 50) / 2,
              width: 50,
              height: 50,
              marginEnd: spacing.small,
            }}
            source={require("../../../assets/images/boy1.jpeg")}
            resizeMode={FastImage.resizeMode.contain}
            onError={() => __DEV__ && console.log("NOIMAGE")}
          />
          <View
            style={{
              backgroundColor: "00b359",
              width: 10,
              height: 10,
              borderRadius: 10 / 2,
              position: "absolute",
              bottom: 0,
              right: 50,
            }}
          ></View>
        </View>
        <View>
          <FastImage
            style={{
              borderRadius: (50 + 50) / 2,
              width: 50,
              height: 50,
              marginEnd: spacing.small,
            }}
            source={require("../../../assets/images/boy2.png")}
            resizeMode={FastImage.resizeMode.contain}
            onError={() => __DEV__ && console.log("NOIMAGE")}
          />

          <View
            style={{
              backgroundColor: "#00ff80",
              width: 10,
              height: 10,
              borderRadius: 20 / 2,
              position: "absolute",
              bottom: 0,
              right: 50,
            }}
          ></View>
        </View>
        <View>
          <FastImage
            style={{
              borderRadius: (50 + 50) / 2,
              width: 50,
              height: 50,
              marginEnd: spacing.small,
            }}
            source={require("../../../assets/images/avatar-placeholder.jpeg")}
            resizeMode={FastImage.resizeMode.contain}
            onError={() => __DEV__ && console.log("NOIMAGE")}
          />
          <View
            style={{
              backgroundColor: "00b359",
              width: 10,
              height: 10,
              borderRadius: 10 / 2,
              position: "absolute",
              bottom: 0,
              right: 50,
            }}
          ></View>
        </View>
        <View>
          <FastImage
            style={{
              borderRadius: (50 + 50) / 2,
              width: 50,
              height: 50,
              marginEnd: spacing.small,
            }}
            source={require("../../../assets/images/avatar-placeholder.jpeg")}
            resizeMode={FastImage.resizeMode.contain}
            onError={() => __DEV__ && console.log("NOIMAGE")}
          />

          <View
            style={{
              backgroundColor: "#00ff80",
              width: 10,
              height: 10,
              borderRadius: 20 / 2,
              position: "absolute",
              bottom: 0,
              right: 50,
            }}
          ></View>
        </View>
      </View>
      <MessageCard title="السلام عليكم ورحمة الله كيف حالكم" read={false} />
      <MessageCard title="جزاكم الله خيراً" read={true} />
      <MessageCard title="السلام عليكم ورحمة الله كيف حالكم" read={false} />
      <MessageCard title="جزاكم الله خيراً" read={true} />
      <MessageCard title="السلام عليكم ورحمة الله كيف حالكم" read={false} />
      <MessageCard title="جزاكم الله خيراً" read={true} />
      <MessageCard title="السلام عليكم ورحمة الله كيف حالكم" read={false} />
      <MessageCard title="جزاكم الله خيراً" read={true} />
    </DrawerLayoutScreen>
  )
})

const MessageCard = ({ title, read }) => {
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
    >
      <View
        style={{
          marginHorizontal: spacing.small,
          backgroundColor: read ? colors.ehkamGrey : colors.ehkamRed,
          borderRadius: 25,
          width: 28,
          height: 28,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon icon="envelope" color={colors.background} size={14} />
      </View>
      <View style={{ flex: 1, marginHorizontal: spacing.small }}>
        <Text weight="book" size="xs" style={{ color: colors.ehkamGrey }}>
          والد الطالب{" "}
          <Text text="عبد الرحمن " weight="bold" size="xs" style={{ color: colors.ehkamCyan }} />
        </Text>
        <Text weight="medium" size="sm" style={{ color: colors.ehkamGrey }}>
          {title}
        </Text>

        <Text weight="book" size="xxs" style={{ color: colors.ehkamGrey, textAlign: "right" }}>
          منذ 3 ساعات و 10 دقائق
        </Text>
      </View>
    </View>
  )
}
