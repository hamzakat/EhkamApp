/* eslint-disable react-native/no-inline-styles */
import { View, Platform, Dimensions, BackHandler } from "react-native"
import React, { useEffect, useRef, useState } from "react"
import DrawerLayout from "react-native-gesture-handler/DrawerLayout"
import { Screen, ScreenProps } from "./Screen"
import { useHeader } from "../utils/useHeader"
import { Icon } from "./Icon"
import { colors, spacing } from "../theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { Text } from "./Text"
import { useStores } from "../models"
import { useNavigation } from "@react-navigation/native"
import { useBackButtonHandler } from "../navigators"

interface DrawerLayoutScreenProps {
  navigation?: any
  title: string // TODO: use React Navigation title route option
  backBtn?: boolean
  transparent?: boolean
  children: React.ReactNode
  ScreenProps?: ScreenProps
  element?: React.ReactElement
}

export const DrawerLayoutScreen: React.FC<React.PropsWithChildren<DrawerLayoutScreenProps>> = (
  props: DrawerLayoutScreenProps,
) => {
  const { authenticationStore, currentUserStore } = useStores()

  const $drawerInsets = useSafeAreaInsetsStyle(["top"])

  const drawerRef = useRef<DrawerLayout>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigation = useNavigation()

  const openDrawer = () => {
    if (!drawerRef.current.state.drawerOpened) {
      drawerRef.current?.openDrawer()
      setDrawerOpen(true)
    }
  }

  const closeDrawer = () => {
    drawerRef.current?.closeDrawer()
    setDrawerOpen(false)

    return true // Return true to indicate that the event has been handled
  }

  useEffect(() => {
    if (drawerOpen) {
      // add event listener when drawer is open
      BackHandler.addEventListener("hardwareBackPress", closeDrawer)
    } else {
      // otherwise, go back if that's possible
      BackHandler.addEventListener("hardwareBackPress", () => {
        if (navigation.canGoBack()) navigation.goBack()
        return true
      })
    }
    navigation.addListener("blur", closeDrawer) // close drawer when we switch the screen
  }, [drawerOpen])

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
          onPress={openDrawer}
        />
      ),

      RightActionComponent: props.element ? (
        props.element
      ) : props.backBtn ? (
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
      drawerWidth={Platform.select({
        default: Dimensions.get("screen").width * 0.75,
        web: Dimensions.get("screen").width * 0.3,
      })}
      drawerType={"front"}
      drawerPosition={"right"}
      drawerBackgroundColor={colors.palette.neutral100}
      overlayColor={colors.palette.overlay20}
      renderNavigationView={() => (
        <DrawerContent
          drawerInsets={$drawerInsets}
          teacherName={currentUserStore.user.fullname}
          schoolName={currentUserStore.user.school_name}
          logout={authenticationStore.logOut}
          navigation={props.navigation}
        />
      )}
      onDrawerClose={() => setDrawerOpen(false)}
      onDrawerOpen={() => setDrawerOpen(true)}
    >
      <Screen
        safeAreaEdges={["bottom"]}
        style={{ flex: 1, marginTop: spacing.small }}
        {...props.ScreenProps}
      >
        {props.children}
      </Screen>
    </DrawerLayout>
  )
}

const DrawerContent = ({ drawerInsets, teacherName, schoolName, navigation, logout }) => {
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
      <View
        style={{
          marginTop: spacing.extraLarge,
          marginHorizontal: spacing.large,
          flex: 1,
          maxHeight: Dimensions.get("screen").height * 0.55,
        }}
      >
        {/* <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
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
        </View> */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="sync" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
            onPress={() => navigation.navigate("Sync")}
          >
            مزامنة السجلات
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.medium }}>
          <Icon icon="qurtasIcon" size={22} color={colors.ehkamCyan} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
            onPress={() => navigation.navigate("About")}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <Icon icon="exit" size={22} color={colors.ehkamRed} />
          <Text
            weight="semiBold"
            style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
            size="md"
            onPress={logout}
          >
            تسجيل خروج
          </Text>
        </View>
      </View>
    </View>
  )
}
