/* eslint-disable react-native/no-inline-styles */
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, View, ViewStyle } from "react-native"
import {
  AutoImage,
  Button,
  Icon,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from "../components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

const headerImg = require("../../assets/images/login-header.jpg")

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(_props) {
  const authPasswordInput = useRef<TextInput>()
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const {
    authenticationStore: {
      authEmail,
      authPassword,
      setAuthEmail,
      setAuthPassword,
      validationErrors,
      logIn,
    },
  } = useStores()

  useEffect(() => {
    // Here is where you could fetch credientials from keychain or storage
    // and pre-fill the form fields.
    __DEV__ && setAuthEmail("superusermhk@gmail.com")
    __DEV__ && setAuthPassword("d1r3ctu5!")
  }, [])

  const errors: typeof validationErrors = isSubmitted ? validationErrors : ({} as any)
  const [loginError, setLoginError] = useState("")

  function loginSubmit() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (Object.values(validationErrors).some((v) => !!v)) return

    // Make a request to your server to get an authentication token.
    // If successful, reset the fields and set the token.
    logIn(authEmail, authPassword).then((result) => {
      if (result.kind === "ok") {
        setIsSubmitted(false)
      } else if (result.kind === "unauthorized") {
        __DEV__ && console.log("Login result:", result.kind)
        setLoginError("كلمة المرور أو الايميل غير صحيحين")
      } else if (result.kind === "cannot-connect") {
        __DEV__ && console.log("Login result:", result.kind)
        setLoginError("مشكلة في الشبكة")
      } else if (result.kind === "not-found") {
        __DEV__ && console.log("Login result:", result.kind)
        setLoginError("حدثت مشكلة أثناء الاتصال بالخادم")
      } else {
        __DEV__ && console.log("Login result:", result.kind)
      }
    })
  }

  const PasswordRightAccessory = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden],
  )

  useEffect(() => {
    return () => {
      setAuthPassword("")
      setAuthEmail("")
    }
  }, [])

  return (
    <Screen preset="auto" safeAreaEdges={["top", "bottom"]}>
      <AutoImage
        source={headerImg}
        style={{
          alignSelf: "center",
          width: "100%",
          height: 300,
          paddingHorizontal: 0,
          paddingBottom: spacing.large,
          top: 1,
        }}
        resizeMethod="auto"
        resizeMode="cover"
      />
      <View style={{ paddingVertical: spacing.large, paddingHorizontal: spacing.large }}>
        <TextField
          value={authEmail}
          onChangeText={setAuthEmail}
          containerStyle={$textField}
          inputWrapperStyle={$inputWrapper}
          style={{ color: colors.ehkamDarkGrey }}
          LabelTextProps={{ style: { color: colors.ehkamPeach }, size: "xs" }}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          label="البريد الالكتروني"
          // placeholder="ادخل بريدك الالكتروني"
          helper={errors?.authEmail}
          HelperTextProps={{ style: { color: colors.ehkamPeach }, size: "xxs", weight: "light" }}
          status={errors?.authEmail ? "error" : undefined}
          onSubmitEditing={() => authPasswordInput.current?.focus()}
        />

        <TextField
          ref={authPasswordInput}
          value={authPassword}
          onChangeText={setAuthPassword}
          containerStyle={$textField}
          inputWrapperStyle={$inputWrapper}
          style={{ color: colors.ehkamDarkGrey }}
          LabelTextProps={{ style: { color: colors.ehkamPeach }, size: "xs" }}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          secureTextEntry={isAuthPasswordHidden}
          label="كلمة المرور"
          // placeholder="أدخل كلمة المرور"
          helper={errors?.authPassword}
          HelperTextProps={{ style: { color: colors.ehkamPeach }, size: "xxs", weight: "light" }}
          status={errors?.authPassword ? "error" : undefined}
          onSubmitEditing={loginSubmit}
          RightAccessory={PasswordRightAccessory}
        />
        {loginError && (
          <Text
            weight="bold"
            size="xxs"
            style={{ color: colors.ehkamRed, textAlign: "center", marginBottom: spacing.small }}
          >
            {loginError}
          </Text>
        )}
        <Button
          testID="login-button"
          text="تسجيل الدخول"
          preset="reversed"
          style={{ backgroundColor: colors.ehkamPeach, borderRadius: spacing.small }}
          onPress={loginSubmit}
        />
      </View>
    </Screen>
  )
})

const $textField: ViewStyle = {
  marginBottom: spacing.medium,
}

const $inputWrapper = {
  borderRadius: spacing.small,
  borderColor: colors.ehkamPeach,
  borderWidth: 1,
  backgroundColor: colors.background,
}
