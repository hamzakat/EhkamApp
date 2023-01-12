import * as React from "react"
import { ComponentType } from "react"
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"

export type IconTypes = keyof typeof iconRegistry

interface IconProps extends TouchableOpacityProps {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: string

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>

  /**
   * An optional function to be called when the icon is pressed
   */
  onPress?: TouchableOpacityProps["onPress"]
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Icon.md)
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...WrapperProps
  } = props

  const isPressable = !!WrapperProps.onPress
  const Wrapper: ComponentType<TouchableOpacityProps> = WrapperProps?.onPress
    ? TouchableOpacity
    : View

  return (
    <Wrapper
      accessibilityRole={isPressable ? "imagebutton" : undefined}
      {...WrapperProps}
      style={$containerStyleOverride}
    >
      <Image
        style={[
          $imageStyle,
          color && { tintColor: color },
          size && { width: size, height: size },
          $imageStyleOverride,
        ]}
        source={iconRegistry[icon]}
      />
    </Wrapper>
  )
}

export const iconRegistry = {
  back: require("../../assets/icons/back.png"),
  bell: require("../../assets/icons/bell.png"),
  caretLeft: require("../../assets/icons/caretLeft.png"),
  caretRight: require("../../assets/icons/caretRight.png"),
  check: require("../../assets/icons/check.png"),
  clap: require("../../assets/icons/clap.png"),
  community: require("../../assets/icons/community.png"),
  components: require("../../assets/icons/components.png"),
  debug: require("../../assets/icons/debug.png"),
  github: require("../../assets/icons/github.png"),
  heart: require("../../assets/icons/heart.png"),
  hidden: require("../../assets/icons/hidden.png"),
  ladybug: require("../../assets/icons/ladybug.png"),
  lock: require("../../assets/icons/lock.png"),
  menu: require("../../assets/icons/menu.png"),
  more: require("../../assets/icons/more.png"),
  pin: require("../../assets/icons/pin.png"),
  podcast: require("../../assets/icons/podcast.png"),
  settings: require("../../assets/icons/settings.png"),
  slack: require("../../assets/icons/slack.png"),
  view: require("../../assets/icons/view.png"),
  x: require("../../assets/icons/x.png"),

  // Ehkamp icons
  home: require("../../assets/icons/ehkam/home.png"),
  envelope: require("../../assets/icons/ehkam/envelope.png"),
  persontime: require("../../assets/icons/ehkam/attendance.png"),
  book: require("../../assets/icons/ehkam/book.png"),
  people: require("../../assets/icons/ehkam/users.png"),

  searchCyan: require("../../assets/icons/ehkam/search-cyan.png"),
  sortCyan: require("../../assets/icons/ehkam/sort-cyan.png"),
  sortPeach: require("../../assets/icons/ehkam/sort-peach.png"),
  filterCyan: require("../../assets/icons/ehkam/filter-cyan.png"),
  filterPeach: require("../../assets/icons/ehkam/filter-peach.png"),
  leftArrowCyan: require("../../assets/icons/ehkam/left-arrow-cyan.png"),
  downArrowsGrey: require("../../assets/icons/ehkam/down-grey.png"),
  upArrowsGrey: require("../../assets/icons/ehkam/up-grey.png"),
  menuCyan: require("../../assets/icons/ehkam/menu-cyan.png"),
  locationCheck: require("../../assets/icons/ehkam/location-check.png"),
  locationPlus: require("../../assets/icons/ehkam/location-plus.png"),
  trash: require("../../assets/icons/ehkam/trash.png"),
  info: require("../../assets/icons/ehkam/info.png"),
  commentBlock: require("../../assets/icons/ehkam/comment-block.png"),
  checkPeach: require("../../assets/icons/ehkam/check-peach.png"),
  record: require("../../assets/icons/ehkam/record.png"),
}

const $imageStyle: ImageStyle = {
  resizeMode: "contain",
}
