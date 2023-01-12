/* eslint-disable react-native/no-inline-styles */
import React from "react"

import { Screen } from "./Screen"
import { useHeader } from "../utils/useHeader"
import { Icon } from "./Icon"
import { colors, spacing } from "../theme"

interface NoDrawerLayoutScreenProps {
  navigation?: any
  title: string // TODO: use React Navigation title route option
  backBtn?: boolean
  children: React.ReactNode
  Icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>
}

export const NoDrawerLayoutScreen: React.FC<React.PropsWithChildren<NoDrawerLayoutScreenProps>> = (
  props: NoDrawerLayoutScreenProps,
) => {
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

      // eslint-disable-next-line no-extra-boolean-cast
      LeftActionComponent: !!props.Icon ? props.Icon : undefined,

      RightActionComponent: props.backBtn ? (
        <Icon
          icon="leftArrowCyan"
          style={{ width: 10, marginStart: spacing.large, marginEnd: spacing.medium }}
          onPress={() => props.navigation.goBack()}
        />
      ) : undefined,
    },
    [],
  )
  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={{ flex: 1 }} preset="fixed">
      {props.children}
    </Screen>
  )
}
