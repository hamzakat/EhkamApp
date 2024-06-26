/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  RefreshControl,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  FlatList,
} from "react-native"

import {
  StudentCard,
  EmptyState,
  SearchBar,
  TextField,
  DrawerLayoutScreen,
  Text,
  Button,
  Icon,
} from "../../../components"
import { useStores } from "../../../models"
import { colors, spacing } from "../../../theme"
// import { FlatList } from "react-native-gesture-handler"
import { Student } from "../../../models/Student"
import { delay } from "../../../utils/delay"

import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationHelpers } from "@react-navigation/native-stack/lib/typescript/src/types"
import { SessionStackScreenProps } from "./SessionStack"
import { getSnapshot } from "mobx-state-tree"
import { values } from "mobx"
import { Dialog } from "react-native-simple-dialogs"

export const SelectStudentScreen: FC<SessionStackScreenProps<"SelectStudent">> = observer(
  function SelectStudentScreen() {
    const { studentStore, sessionStore } = useStores()

    const navigation: NativeStackNavigationHelpers = useNavigation()

    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const searchBarRef = useRef(undefined)
    const [searchBarFocused, setSearchBarFocused] = useState(false)
    const [searchPhrase, setSearchPhrase] = useState("")

    const [searchID, setSearchID] = useState("")
    useEffect(() => {
      console.log(searchID)
    }, [searchID])
    const loadStores = () => {
      ;(async function load() {
        await studentStore.fetchStudents()
        await sessionStore.fetchSessions()
        __DEV__ && console.log("Loading stores from Select Student Screen")
      })()
    }

    useEffect(() => {
      loadStores()

      const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () =>
        searchBarRef.current.blur(),
      )
      return () => {
        keyboardDidHideListener.remove()
      }
    }, [studentStore])

    const manualRefresh = async () => {
      setRefreshing(true)
      console.log("refreshing...")

      await Promise.all([studentStore.fetchStudents(), delay(750)])
      setRefreshing(false)
    }

    const [showExamQNumModal, setShowExamQNumModal] = useState(false)
    const [examQNum, setExamQNum] = useState("")
    const [qNumError, setQNumError] = useState("")
    const [qNumValid, setQNumValid] = useState(false)

    const handleInputChange = (text) => {
      // Validate the input value
      const numericValue = parseInt(text)
      if (numericValue >= 0 && numericValue <= 50) {
        setQNumError("")
        setQNumValid(true)
      } else if (text === "") {
        setQNumError("")
        setQNumValid(false)
      } else {
        setQNumError("ادخل قيمة بين 0 و 50")
        setQNumValid(false)
      }
      setExamQNum(numericValue)
    }

    const selectStudent = (student: Student) => {
      sessionStore.setProp("selectedStudent", getSnapshot(student))
      if (sessionStore.selectedSessionType === "exam") {
        // show model to propmt the user to enter the numbers of planned questions
        setShowExamQNumModal(true)
      } else {
        navigation.navigate("SessionSetup")
      }
    }

    const startExamSession = () => {
      setShowExamQNumModal(false)
      navigation.navigate("ExamSession", { examQNum: examQNum })
    }

    const renderSearchItem = ({ item }: { item: Student }) => {
      if (searchID === "") {
        if (searchPhrase === "") {
          return (
            <StudentCard
              key={item.id}
              student={item}
              onPress={() => selectStudent(item)}
              additionalComponent={
                <View
                  style={{
                    backgroundColor: colors.ehkamCyan,
                    width: 25,
                    height: 25,
                    borderRadius: 25,
                    justifyContent: "space-around",
                    alignItems: "center",
                    paddingVertical: spacing.tiny,
                    marginHorizontal: spacing.small,
                  }}
                >
                  <Text weight="bold" style={{ color: colors.background }} size="xxs">
                    {item.inclass_id}
                  </Text>
                </View>
              }
            />
          )
        }
        // filter of the name
        if (item.fullname.includes(searchPhrase.trim().replace(/\s/g, ""))) {
          return (
            <StudentCard
              key={item.id}
              student={item}
              onPress={() => selectStudent(item)}
              additionalComponent={
                <View
                  style={{
                    backgroundColor: colors.ehkamCyan,
                    width: 25,
                    height: 25,
                    borderRadius: 25,
                    justifyContent: "space-around",
                    alignItems: "center",
                    paddingVertical: spacing.tiny,
                    marginHorizontal: spacing.small,
                  }}
                >
                  <Text weight="bold" style={{ color: colors.background }} size="xxs">
                    {item.inclass_id}
                  </Text>
                </View>
              }
            />
          )
        }
      }
      if (item.inclass_id.toString() === searchID) {
        return (
          <StudentCard
            key={item.id}
            student={item}
            onPress={() => selectStudent(item)}
            additionalComponent={
              <View
                style={{
                  backgroundColor: colors.ehkamCyan,
                  width: 25,
                  height: 25,
                  borderRadius: 25,
                  justifyContent: "space-around",
                  alignItems: "center",
                  paddingVertical: spacing.tiny,
                  marginHorizontal: spacing.small,
                }}
              >
                <Text weight="bold" style={{ color: colors.background }} size="xxs">
                  {item.inclass_id}
                </Text>
              </View>
            }
          />
        )
      }
    }

    return (
      <DrawerLayoutScreen navigation={navigation} title="اختر الطالب" backBtn={true}>
        {/* Students list & Search Area */}

        <View style={{ justifyContent: "space-between" }}>
          <Dialog
            visible={showExamQNumModal}
            onTouchOutside={() => setShowExamQNumModal(false)}
            dialogStyle={{
              backgroundColor: colors.background,
              borderRadius: spacing.small,
            }}
          >
            <View>
              <Icon
                icon="x"
                style={{ position: "absolute", top: -12, right: -12, alignSelf: "flex-end" }}
                color={colors.ehkamDarkGrey}
                onPress={() => setShowExamQNumModal(false)}
              />

              <Text
                weight="medium"
                text={"أدخل عدد أسئلة الاختبار"}
                style={{
                  color: colors.ehkamDarkGrey,
                  textAlign: "center",
                  marginVertical: spacing.medium,
                }}
                size="md"
              />
              <TextField
                placeholder="عدد الأسئلة"
                keyboardType="number-pad"
                value={examQNum}
                onChangeText={handleInputChange}
                inputWrapperStyle={{
                  alignItems: "center",
                  maxWidth: 150,
                }}
                containerStyle={{ alignItems: "center" }}
              />
              {qNumError ? (
                <Text
                  weight="light"
                  size="xs"
                  style={{ color: colors.ehkamRed, marginTop: spacing.small }}
                >
                  {qNumError}
                </Text>
              ) : null}
              {qNumValid ? (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: spacing.medium,
                    justifyContent: "space-around",
                  }}
                >
                  <Button
                    text={"ابدأ الاختبار"}
                    textStyle={{ color: colors.background }}
                    style={{
                      borderWidth: 0,
                      borderRadius: spacing.small,
                      width: 120,
                      backgroundColor: colors.ehkamCyan,
                    }}
                    onPress={startExamSession}
                  />
                </View>
              ) : null}
            </View>
          </Dialog>
          <TouchableWithoutFeedback onPress={() => searchBarRef.current.blur()}>
            <FlatList<Student>
              /* Search area */
              ListHeaderComponent={
                <View style={searchBarFocused ? $searchBarFocused : $searchBarBlurred}>
                  <Text
                    text="ادخل اسم أو رقم الطالب"
                    weight="book"
                    size="xs"
                    style={{ color: colors.ehkamGrey, marginStart: spacing.small }}
                  />
                  <SearchArea
                    searchBarFocused={searchBarFocused}
                    setSearchBarFocused={setSearchBarFocused}
                    setSearchPhrase={setSearchPhrase}
                    searchBarRef={searchBarRef}
                    setSearchID={setSearchID}
                  />
                </View>
              }
              contentContainerStyle={$contentContainer}
              data={studentStore.students}
              refreshing={refreshing}
              onRefresh={manualRefresh}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => manualRefresh()} />
              }
              renderItem={renderSearchItem}
              ListEmptyComponent={
                isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <EmptyState
                    preset="generic"
                    buttonOnPress={manualRefresh}
                    ImageProps={{ resizeMode: "contain" }}
                    heading="القائمة فارغة"
                    content=""
                    button="تحديث القائمة"
                    ButtonProps={{ preset: "reversed" }}
                    buttonStyle={$addStudentButton}
                    imageSource={{}}
                  />
                )
              }
            />
          </TouchableWithoutFeedback>
        </View>
      </DrawerLayoutScreen>
    )
  },
)

const SearchArea = function ({
  searchBarRef,
  searchBarFocused,
  setSearchPhrase,
  setSearchBarFocused,
  setSearchID,
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: spacing.medium,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextField
          containerStyle={{ flex: 0.25, marginEnd: spacing.small }}
          inputWrapperStyle={{
            borderColor: colors.ehkamPeach,
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: colors.background,
          }}
          placeholder="الرقم..."
          LabelTextProps={{ weight: "book" }}
          placeholderTextColor={colors.ehkamGrey}
          onChangeText={(value) => setSearchID(value)}
          keyboardType="number-pad"
        />
        <SearchBar
          ref={searchBarRef}
          onFocus={() => setSearchBarFocused(true)}
          onBlur={() => setSearchBarFocused(false)}
          onChangeText={(value) => setSearchPhrase(value)}
          style={{ flex: 0.75 }}
        />
      </View>
    </View>
  )
}

const $searchBarBlurred: ViewStyle = {
  flex: 0.75,
}

const $searchBarFocused: ViewStyle = {
  flex: 1,
}

const $addStudentButton: ViewStyle = {
  backgroundColor: colors.ehkamPeach,
  borderRadius: 20,
}

const $contentContainer: ViewStyle = {
  alignContent: "center",
  paddingHorizontal: spacing.large,
  marginTop: spacing.small,
  paddingBottom: Dimensions.get("screen").height * 0.2,
}
