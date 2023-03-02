/* eslint-disable react-native/no-inline-styles */
import React, { FC } from "react"
import { useNavigation } from "@react-navigation/native"
import { AutoImage, Icon, IconTypes, NoDrawerLayoutScreen, Text } from "../components"
import { colors, spacing } from "../theme"
import { AppStackScreenProps } from "../navigators"
import { View, Linking } from "react-native"
import { openLinkInBrowser } from "../utils/openLinkInBrowser"

interface AboutScreenProps extends AppStackScreenProps<"About"> {}

const headerImg = require("../../assets/images/about-header.png")

export const AboutScreen: FC<AboutScreenProps> = function AboutScreen(_props) {
  const navigation = useNavigation()

  return (
    <NoDrawerLayoutScreen
      Icon={<Icon icon="qurtasIcon" containerStyle={{ marginHorizontal: spacing.medium }} />}
      title="الشركة المطوّرة"
      backBtn={true}
      navigation={navigation}
      preset="scroll"
      safeAreaEdge={["bottom"]}
    >
      <View style={{ paddingHorizontal: 0, paddingBottom: spacing.large, top: 1 }}>
        <AutoImage
          source={headerImg}
          style={{
            alignSelf: "center",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            width: "100%",
            height: 200,
          }}
          resizeMethod="auto"
          resizeMode="cover"
        />
      </View>
      <View style={{ paddingHorizontal: spacing.medium }}>
        <ListItem
          link="+90 53 83 2009 86"
          iconName="wp"
          description="تواصل معنا عبر واتس أب"
          onTouchEnd={() =>
            Linking.openURL("whatsapp://send?phone=905383200986").catch(() =>
              openLinkInBrowser("https://wa.me/+905383200986"),
            )
          }
        />
        <ListItem
          link="@QURTAS"
          iconName="tg"
          description="تواصل معنا عبر تلغرام"
          onTouchEnd={() => openLinkInBrowser("https://t.me/qurtas")}
        />
        <ListItem
          link="@QurtasStudio"
          iconName="fb"
          description="تابعنا على فيس بوك"
          onTouchEnd={() => openLinkInBrowser("https://facebook.com/QurtasStudio")}
        />
        <ListItem
          link="Be.net/Qurtas.Studio"
          iconName="behance"
          description="شاهد نماذج أعمالنا على بيهانس"
          onTouchEnd={() => openLinkInBrowser("https://behance.net/Qurtas.Studio")}
        />
        <ListItem
          link="QurtasGroup.com"
          iconName="globe"
          description="لزيارة موقعنا الالكتروني"
          onTouchEnd={() => openLinkInBrowser("https://QurtasGroup.com")}
        />
      </View>
    </NoDrawerLayoutScreen>
  )
}

export interface ListItemProps {
  link: string
  description: string
  iconName: IconTypes
  onTouchEnd?: () => void
}

const ListItem = (props: ListItemProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 12,
        marginBottom: spacing.small,

        alignItems: "center",
        backgroundColor: colors.background,

        shadowColor: colors.palette.neutral800,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 4,
      }}
      onTouchEnd={props.onTouchEnd}
    >
      <View
        style={{
          marginStart: spacing.large,

          borderRadius: 25,
          width: 28,
          height: 28,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon icon={props.iconName} color={colors.ehkamPeach} size={spacing.large} />
      </View>
      <View style={{ flex: 1, margin: spacing.small }}>
        <Text weight="medium" size="sm" style={{ color: colors.ehkamDarkGrey, textAlign: "left" }}>
          {props.link}
        </Text>

        <Text weight="bold" size="xxs" style={{ color: colors.ehkamGrey }}>
          {props.description}
        </Text>
      </View>
      <Icon
        icon="leftArrow"
        size={spacing.small}
        color={colors.ehkamPeach}
        style={{ marginEnd: spacing.medium }}
      />
    </View>
  )
}
