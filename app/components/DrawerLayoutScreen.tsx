/* eslint-disable react-native/no-inline-styles */
import { View, Platform, Dimensions } from "react-native"
import React, { useRef, useState } from "react"
import DrawerLayout from "react-native-gesture-handler/DrawerLayout"
import { Screen, ScreenProps } from "./Screen"
import { useHeader } from "../utils/useHeader"
import { Icon } from "./Icon"
import { colors, spacing } from "../theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { Text } from "./Text"
import { useStores } from "../models"

interface DrawerLayoutScreenProps {
  navigation?: any
  title: string // TODO: use React Navigation title route option
  backBtn?: boolean
  transparent?: boolean
  children: React.ReactNode
  ScreenProps?: ScreenProps
}

export const DrawerLayoutScreen: React.FC<React.PropsWithChildren<DrawerLayoutScreenProps>> = (
  props: DrawerLayoutScreenProps,
) => {
  const { currentUserStore } = useStores()

  const $drawerInsets = useSafeAreaInsetsStyle(["top"])

  const drawerRef = useRef<DrawerLayout>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toggleDrawer = () => {
    if (!drawerOpen) {
      setDrawerOpen(true)
      drawerRef.current?.openDrawer()
    } else {
      setDrawerOpen(false)
      drawerRef.current?.closeDrawer()
    }
  }

  // TODO: close drawer on blur?
  const closeDrawer = () => {
    if (drawerOpen) {
      setDrawerOpen(false)
      drawerRef.current?.closeDrawer()
    }
  }
  useHeader(
    {
      title: props.title,
      titleMode: "flex",
      titleStyle: {
        color: colors.ehkamGrey,
        textAlign: "auto",
      },
      containerStyle: {
        flexDirection: "column",
        shadowColor: colors.shadow,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
      },
      backgroundColor: props.transparent ? colors.transparent : colors.background,

      LeftActionComponent: (
        <Icon
          icon="menuCyan"
          color={
            props.transparent
              ? drawerOpen
                ? colors.ehkamCyan
                : colors.background
              : colors.ehkamCyan
          }
          style={{ width: 20, marginStart: spacing.large, marginEnd: spacing.medium }}
          onPress={toggleDrawer}
        />
      ),

      RightActionComponent: props.backBtn ? (
        <Icon
          icon="leftArrow"
          color={props.transparent ? colors.background : colors.ehkamCyan}
          style={{ width: 10, marginStart: spacing.large, marginEnd: spacing.medium }}
          onPress={() => props.navigation.goBack()}
        />
      ) : undefined,
    },
    [drawerOpen],
  )
  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={Platform.select({ default: 326, web: Dimensions.get("screen").width * 0.3 })}
      drawerType={"front"}
      drawerPosition={"right"}
      drawerBackgroundColor={colors.palette.neutral100}
      overlayColor={colors.palette.overlay20}
      renderNavigationView={() => (
        <DrawerContent
          drawerInsets={$drawerInsets}
          teacherName={currentUserStore.user.fullname}
          schoolName={currentUserStore.user.school_name}
          navigation={props.navigation}
        />
      )}
    >
      <Screen safeAreaEdges={["top", "bottom"]} style={{ flex: 1 }} {...props.ScreenProps}>
        {props.children}
      </Screen>
    </DrawerLayout>
  )
}

const DrawerContent = ({ drawerInsets, teacherName, schoolName, navigation }) => {
  return (
    <View style={[{ flex: 1 }, drawerInsets]}>
      {/* teacher's name + school name */}
      <View style={{ flexDirection: "row", marginStart: spacing.extraSmall, alignItems: "center" }}>
        <Icon icon="drawerProfileCircle" />
        <View style={{ paddingVertical: spacing.small }}>
          <Text weight="semiBold" style={{ color: colors.ehkamPeach }}>
            {teacherName}
          </Text>
          <Text weight="book" size="xxs" style={{ color: colors.ehkamCyan }}>
            {schoolName}
          </Text>
        </View>
      </View>

      {/* navigation list */}
      <View style={{ marginTop: spacing.extraLarge, marginHorizontal: spacing.large }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="notificationBell" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
          >
            الاشعارات
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="pieChart" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
          >
            الاحصائيات
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="sync" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
            onPress={() => navigation.navigate("Sync")}
          >
            مزامنة الجلسات
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="qurtasIcon" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
          >
            الشركة المطورة
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="share" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
          >
            مشاركة التطبيق
          </Text>
        </View>
      </View>
    </View>
  )
}
