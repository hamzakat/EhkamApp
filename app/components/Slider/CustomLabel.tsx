import React from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { colors } from "../../theme/"

const AnimatedView = Animated.createAnimatedComponent(View)

CustomLabel.defaultProps = {
  leftDiff: 0,
}

const width = 25
const pointerWidth = width * 0.47

function LabelBase(props) {
  const { position, value, leftDiff, pressed } = props
  const scaleValue = React.useRef(new Animated.Value(0.1)) // Behaves oddly if set to 0
  const cachedPressed = React.useRef(pressed)

  React.useEffect(() => {
    Animated.timing(scaleValue.current, {
      toValue: pressed ? 1 : 0.1,
      duration: 200,
      delay: pressed ? 0 : 1500,
      useNativeDriver: false,
    }).start()
    cachedPressed.current = pressed
  }, [pressed])

  return (
    Number.isFinite(position) &&
    Number.isFinite(value) && (
      <View>
        <AnimatedView
          style={[
            styles.sliderLabel,
            {
              left: position - width / 2,
              transform: [
                { translateY: width + 20 },
                { scale: scaleValue.current },
                { translateY: -width },
              ],
            },
          ]}
        >
          <View style={styles.pointer} />
          <Text style={styles.sliderLabelText}>{value}</Text>
        </AnimatedView>
      </View>
    )
  )
}

export default function CustomLabel(props) {
  const {
    leftDiff,
    oneMarkerValue,
    twoMarkerValue,
    oneMarkerLeftPosition,
    twoMarkerLeftPosition,
    oneMarkerPressed,
    twoMarkerPressed,
  } = props

  return (
    <View style={styles.parentView}>
      <LabelBase
        position={oneMarkerLeftPosition}
        value={oneMarkerValue}
        leftDiff={leftDiff}
        pressed={oneMarkerPressed}
      />
      <LabelBase
        position={twoMarkerLeftPosition}
        value={twoMarkerValue}
        leftDiff={leftDiff}
        pressed={twoMarkerPressed}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  parentView: {
    position: "relative",
  },
  pointer: {
    backgroundColor: colors.ehkamCyan,
    bottom: -pointerWidth / 4,
    height: pointerWidth,
    left: (width - pointerWidth) / 2,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    width: pointerWidth,
  },
  sliderLabel: {
    bottom: "100%",
    height: width,
    justifyContent: "center",
    position: "absolute",
    width: width,
  },
  sliderLabelText: {
    backgroundColor: colors.background,
    borderColor: colors.ehkamCyan,
    borderRadius: width / 2,
    borderWidth: 2,
    color: colors.ehkamCyan,
    flex: 1,
    fontSize: 14,
    lineHeight: width,
    textAlign: "center",
  },
})
