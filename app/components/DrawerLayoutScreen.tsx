/* eslint-disable react-native/no-inline-styles */
import { View, Text, Platform, Dimensions } from "react-native"
import React, { useRef, useState } from "react"
import DrawerLayout from "react-native-gesture-handler/DrawerLayout"
import { Screen } from "./Screen"
import { useHeader } from "../utils/useHeader"
import { Icon } from "./Icon"
import { colors, spacing } from "../theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

interface DrawerLayoutScreenProps {
  navigation?: any
  title: string // TODO: use React Navigation title route option
  backBtn?: boolean
  children: React.ReactNode
}

export const DrawerLayoutScreen: React.FC<React.PropsWithChildren<DrawerLayoutScreenProps>> = (
  props: DrawerLayoutScreenProps,
) => {
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

      LeftActionComponent: (
        <Icon
          icon="menuCyan"
          style={{ width: 20, marginStart: spacing.large, marginEnd: spacing.medium }}
          onPress={toggleDrawer}
        />
      ),

      RightActionComponent: props.backBtn ? (
        <Icon
          icon="leftArrowCyan"
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
      renderNavigationView={() => <DrawerContent drawerInsets={$drawerInsets} />}
    >
      <Screen safeAreaEdges={["top", "bottom"]} style={{ flex: 1 }} preset="fixed">
        {props.children}
      </Screen>
    </DrawerLayout>
  )
}

const DrawerContent = ({ drawerInsets }) => {
  return (
    <View style={[{ flex: 1 }, drawerInsets]}>
      <Text>اسم الاستاذ</Text>
    </View>
  )
}
