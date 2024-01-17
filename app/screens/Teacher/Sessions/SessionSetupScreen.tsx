/* eslint-disable react-native/no-inline-styles */
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, ScrollView, Dimensions } from "react-native"
import {
  BorderedText,
  BorderedTextField,
  Button,
  DrawerLayoutScreen,
  Icon,
  Text,
  WarningDialog,
} from "../../../components"
import { spacing, colors } from "../../../theme"
import ModalSelector from "react-native-modal-selector"
import { SessionStackScreenProps, VersesListItem } from "./SessionStack"
import { useStores } from "../../../models"
import { Student } from "../../../models/Student"
import { Session } from "../../../models/Session"

export const SessionSetupScreen: FC<SessionStackScreenProps<"SessionSetup">> = observer(
  function SessionSetupScreen({ navigation }) {
    const muhsaf = require("../../../../assets/data/quranjson/muhsaf.json")

    const [dialogVisible, setDialogVisible] = useState(false)

    const [startPage, setStartPage] = useState("")
    const [startChapter, setStartChapter] = useState({ label: "الفاتحة", key: 1 })
    const [startVerse, setStartVerse] = useState({ label: "1", key: 1 })

    const [endPage, setEndPage] = useState("")
    const [endChapter, setEndChapter] = useState({ label: "الفاتحة", key: 1 })
    const [endVerse, setEndVerse] = useState({ label: "1", key: 1 })

    const [chaptersInStartPage, setChaptersInStartPage] = useState([])
    const [chaptersInEndPage, setChaptersInEndPage] = useState([])

    const [versesInStartPage, setVersesInStartPage] = useState([])
    const [versesInEndPage, setVersesInEndPage] = useState([])

    const [showEndPageWarning, setShowEndPageWarning] = useState(false)
    const [showStartPageWarning, setShowStartPageWarning] = useState(false)


    /* for sessions of type "new", get the student's last checkpoints automatically */
    const { sessionStore } = useStores()
    useEffect(() => {
      if (sessionStore.selectedSessionType === "new") {
        __DEV__ && console.log("Auto")
        const selectedStudent: Student = sessionStore.selectedStudent
        const lastNewSession: Session = selectedStudent?.lastNewSession
        if (lastNewSession !== undefined && lastNewSession.end_page !== 604)
          setStartPage((lastNewSession.end_page + 1).toString())
      }
    }, [])

    useEffect(() => {
      if (validPageNumber(startPage)) {
        setShowStartPageWarning(false)
        const chapterNumbers = Object.keys(muhsaf[startPage])

        chapterNumbers.pop() // workaround: remove the latest key "juzNumber"
        const chaptersModalList = chapterNumbers.map((k) => {
          return { key: parseInt(k), label: muhsaf[startPage][k].titleAr }
        })

        setChaptersInStartPage(chaptersModalList)
        setStartChapter(chaptersModalList[0])

        // get the verses list of the first chapter in the page
        // for multi-chapters pages, that can be changed in another useEffect function
        const currentVersesList = muhsaf[startPage][chapterNumbers[0]]
        const versesModalList = currentVersesList.text.map((verse) => {
          return { key: parseInt(verse.verseNumber), label: verse.verseNumber }
        })

        setVersesInStartPage(versesModalList)
        setStartVerse(versesModalList[0])
      } else {
        setShowStartPageWarning(true)
      }
    }, [startPage])

    useEffect(() => {
      if (validPageNumber(startPage)) {
        // update verses list
        const currentChapterNumber = startChapter.key.toString()
        const currentChapter = muhsaf[startPage][currentChapterNumber]
        const versesModalList = currentChapter.text.map((verse) => {
          return { key: parseInt(verse.verseNumber), label: verse.verseNumber }
        })

        setVersesInStartPage(versesModalList)
        setStartVerse(versesModalList[0])
      }
    }, [startChapter])

    useEffect(() => {
      if (validPagesRange()) {
        setShowEndPageWarning(false)
        const chapterNumbers = Object.keys(muhsaf[endPage])
        chapterNumbers.pop() // workaround: remove the latest key "juzNumber"
        const chaptersModalList = chapterNumbers.map((k) => {
          return { key: parseInt(k), label: muhsaf[endPage][k].titleAr }
        })

        setChaptersInEndPage(chaptersModalList)
        setEndChapter(chaptersModalList[0])

        // get the verses list of the first chapter in the page
        // for multi-chapters pages, that can be changed in another useEffect function
        const currentVersesList = muhsaf[endPage][chapterNumbers[0]]
        const versesModalList = currentVersesList.text.map((verse) => {
          return { key: parseInt(verse.verseNumber), label: verse.verseNumber }
        })

        setVersesInEndPage(versesModalList)
        setEndVerse(versesModalList[0])
      } else {
        setShowEndPageWarning(true)
      }
    }, [endPage])

    useEffect(() => {
      if (validPagesRange() && validChaptersRange()) {
        // update verses list
        const currentChapterNumber = endChapter.key.toString()
        const currentChapter = muhsaf[endPage][currentChapterNumber]
        const versesModalList = currentChapter.text.map((verse) => {
          return { key: parseInt(verse.verseNumber), label: verse.verseNumber }
        })

        setVersesInEndPage(versesModalList)
        setEndVerse(versesModalList[0])
      }
    }, [endChapter])

    const validPageNumber = (str: string): boolean => {
      const converted = Number(str)
      if (!isNaN(converted) && Number.isInteger(converted))
        return converted >= 1 && converted <= 604
      return false
    }

    const validPagesRange = (): boolean => {
      if (validPageNumber(startPage) && validPageNumber(endPage))
        return parseInt(startPage) <= parseInt(endPage)
      return false
    }
    const validChaptersRange = (): boolean => {
      if (validPagesRange()) return startChapter.key <= endChapter.key
      return false
    }
    const validVersesRange = (): boolean => {
      if (validPagesRange() && validChaptersRange()) {
        if (startChapter.key === endChapter.key) return startVerse.key <= endVerse.key
        else return true
      }
      return false
    }
    const validCheckpoints = (): boolean => {
      return validPagesRange() && validChaptersRange() && validVersesRange()
    }

    const startSession = (): void => {
      // if validCheckpoints, get verses, and navigate (pass verses as params)
      // else, show warning
      if (validCheckpoints()) {
        const versesList: VersesListItem[] = getVerses()

        sessionStore.setProp("currentSessionVerses", versesList)
        navigation.navigate("Session", {
          versesList,
          startPage: parseInt(startPage),
          endPage: parseInt(endPage),
          startChapter: startChapter.key,
          endChapter: endChapter.key,
          startVerse: startVerse.key,
          endVerse: endVerse.key,
        })
      } else {
        setDialogVisible(true)
      }
    }

    const getVerses = (): any => {
      const versesList: VersesListItem[] = []

      let chapterTitle = ""

      for (let pageNumber = parseInt(startPage); pageNumber <= parseInt(endPage); pageNumber++) {
        for (const chapterNumber in muhsaf[pageNumber]) {
          if (
            Object.prototype.hasOwnProperty.call(muhsaf[pageNumber], chapterNumber) &&
            parseInt(chapterNumber) <= endChapter.key
          ) {
            const chapterObj = muhsaf[pageNumber][chapterNumber]

            if (chapterTitle !== chapterObj.titleAr) {
              // starting with a new chapter, add a chapterTitle item
              chapterTitle = chapterObj.titleAr
              versesList.push({
                type: "chapterTitle",
                chapterTitle: chapterTitle,
                chapterNumber: chapterNumber,
              })
            }

            if (pageNumber === parseInt(endPage)) {
              // for the last page in the range, take into account the end verse limit
              chapterObj.text.forEach((verse: { verseNumber: string; text: string }) => {
                const verseNumber = parseInt(verse.verseNumber)
                if (verseNumber <= endVerse.key) {
                  versesList.push({
                    pageNumber: pageNumber,
                    verseNumber: parseInt(verse.verseNumber),
                    verseText: verse.text,
                    chapterTitle: chapterTitle,
                    chapterNumber: chapterNumber,
                    type: "verse",
                  })
                }
              })
            } else {
              // for other pages, add all text content
              chapterObj.text.forEach((verse: { verseNumber: string; text: string }) => {
                versesList.push({
                  pageNumber: pageNumber,
                  verseNumber: parseInt(verse.verseNumber),
                  verseText: verse.text,
                  chapterTitle: chapterTitle,
                  chapterNumber: chapterNumber,
                  type: "verse",
                })
              })
            }
          }
        }
      }

      return versesList
    }
    const reset = (): void => {
      setStartPage("1")
      setStartChapter({ label: "الفاتحة", key: 1 })
      setStartVerse({ label: "1", key: 1 })
      setEndPage("")
      setEndChapter({ label: "الفاتحة", key: 1 })
      setEndVerse({ label: "1", key: 1 })
    }

    return (
      <DrawerLayoutScreen title="جلسة جديدة" backBtn={true} navigation={navigation}>
        <WarningDialog
          cancel={() => setDialogVisible(false)}
          visible={dialogVisible}
          preset="peach"
          text="تأكد من صحّة إدخال نقطة البداية والنهاية"
          buttonText="رجوع"
        />
        <ScrollView contentContainerStyle={$contentContainer}>
          <View style={{ marginBottom: spacing.large }}>
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 0.5,
                borderBottomColor: colors.ehkamGrey,
                marginBottom: spacing.small,
                paddingBottom: spacing.tiny,
              }}
            >
              <Icon icon="locationPlus" size={20} color={colors.ehkamCyan} />
              <Text
                text="نقطة البداية"
                weight="bold"
                size="sm"
                style={{ color: colors.ehkamPeach, marginStart: spacing.small }}
              />
            </View>
            <View style={{ paddingHorizontal: spacing.large }}>
              <View style={{ flexDirection: "row", marginBottom: spacing.small }}>
                <BorderedText text="رقم الصفحة" disabled={true} style={{ flex: 0.6 }} />
                <BorderedTextField
                  editable={true}
                  inputWrapperStyle={{ borderColor: colors.ehkamPeach }}
                  onChangeText={setStartPage}
                  value={startPage}
                  containerStyle={{ marginStart: spacing.small }}
                  keyboardType="number-pad"
                />
              </View>

              {showStartPageWarning && (
                <Text
                  size="xs"
                  weight="light"
                  style={{ marginBottom: spacing.small, color: colors.ehkamRed }}
                  text="تأكد من إدخال رقم صفحة صحيح"
                />
              )}

              <ModalSelect
                options={chaptersInStartPage}
                placeholder={"سورة"}
                selectedOpt={startChapter.label}
                selectedKey={startChapter.key}
                onChange={setStartChapter}
                containerStyle={{ flex: 1, marginBottom: spacing.small }}
                disabled={!validPageNumber(startPage)}
              />
              <View style={{ flexDirection: "row", marginBottom: spacing.small }}>
                <BorderedText text="رقم الآية" disabled={true} style={{ flex: 0.6 }} />
                <ModalSelect
                  options={versesInStartPage}
                  selectedOpt={startVerse.label}
                  selectedKey={startVerse.key}
                  onChange={setStartVerse}
                  containerStyle={{ flex: 0.4, marginStart: spacing.small }}
                  disabled={!validPageNumber(startPage)}
                />
              </View>
            </View>
          </View>
          <View style={{ marginBottom: spacing.large }}>
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 0.5,
                borderBottomColor: colors.ehkamGrey,
                marginBottom: spacing.small,
                paddingBottom: spacing.tiny,
              }}
            >
              <Icon icon="locationCheck" size={20} color={colors.ehkamCyan} />
              <Text
                text="نقطة النهاية"
                weight="bold"
                size="sm"
                style={{ color: colors.ehkamPeach, marginStart: spacing.small }}
              />
            </View>
            <View style={{ paddingHorizontal: spacing.large }}>
              <View style={{ flexDirection: "row", marginBottom: spacing.small }}>
                <BorderedText text="رقم الصفحة" disabled={true} style={{ flex: 0.6 }} />
                <BorderedTextField
                  onChangeText={setEndPage}
                  value={endPage}
                  containerStyle={{ marginStart: spacing.small }}
                  editable={validPageNumber(startPage)}
                  inputWrapperStyle={
                    validPageNumber(startPage) ? { borderColor: colors.ehkamPeach } : {}
                  }
                  textStyle={
                    validPageNumber(startPage)
                      ? { color: colors.ehkamCyan }
                      : { color: colors.ehkamDarkGrey }
                  }
                  keyboardType="number-pad"
                />
              </View>

              {showEndPageWarning && (
                <Text
                  size="xs"
                  weight="light"
                  style={{ marginBottom: spacing.small, color: colors.ehkamRed }}
                  text="تأكد من إدخال رقم صفحة صحيح"
                />
              )}

              <ModalSelect
                options={chaptersInEndPage}
                placeholder={"سورة"}
                selectedOpt={endChapter.label}
                selectedKey={endChapter.key}
                onChange={setEndChapter}
                containerStyle={{ marginBottom: spacing.small, flex: 1 }}
                disabled={!validPagesRange()}
              />
              <View style={{ flexDirection: "row", marginBottom: spacing.small }}>
                <BorderedText text="رقم الآية" disabled={true} style={{ flex: 0.6 }} />
                <ModalSelect
                  options={versesInEndPage}
                  selectedOpt={endVerse.label}
                  selectedKey={endVerse.key}
                  onChange={setEndVerse}
                  containerStyle={{ flex: 0.4, marginStart: spacing.small }}
                  disabled={!(validPagesRange() && validChaptersRange())}
                />
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Button
              style={{
                flex: 0.12,
                marginEnd: spacing.extraSmall,
                backgroundColor: colors.ehkamRed,
                borderWidth: 0,
                borderRadius: 9,
              }}
              textStyle={{ alignItems: "center" }}
              onPress={reset}
            >
              <Icon icon="trash" size={20} />
            </Button>
            {/* <Button
              style={{
                flex: 0.44,
                marginEnd: spacing.extraSmall,
                backgroundColor: colors.ehkamGrey,
                borderWidth: 0,
                borderRadius: 9,
              }}
            >
              <Text text="حفظ مؤقت" weight="bold" size="md" style={{ color: colors.background }} />
            </Button> */}
            <Button
              style={{
                flex: 0.5,
                backgroundColor: colors.ehkamPeach,
                borderWidth: 0,
                borderRadius: 9,
              }}
              onPress={() => startSession()}
            >
              <Text
                text="بدء الجلسة"
                weight="bold"
                size="md"
                style={{ color: colors.background }}
              />
            </Button>
          </View>
        </ScrollView>
      </DrawerLayoutScreen>
    )
  },
)

const ModalSelect = function ({
  options,
  onChange,
  placeholder,
  selectedOpt,
  selectedKey,
  containerStyle,
  disabled,
}: {
  options: any
  onChange?: any
  placeholder?: string
  selectedOpt: any
  selectedKey: number
  containerStyle?: ViewStyle
  disabled?: boolean
}) {
  return (
    <View style={containerStyle}>
      <ModalSelector
        data={options}
        onChange={(option) => onChange({ label: option.label, key: option.key })}
        disabled={disabled}
        selectedKey={selectedKey}
        cancelText="رجوع"
        cancelTextStyle={{
          fontSize: 14,
          fontFamily: "expoArabicMedium",
          color: colors.ehkamPeach,
        }}
        optionTextStyle={{
          fontSize: 16,
          fontFamily: "expoArabicMedium",
          color: colors.ehkamDarkGrey,
        }}
        selectedItemTextStyle={{
          fontSize: 16,
          fontFamily: "expoArabicSemiBold",
          color: colors.ehkamCyan,
        }}
        // eslint-disable-next-line react-native/no-color-literals
        overlayStyle={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: disabled ? colors.ehkamGrey : colors.ehkamPeach,
            borderRadius: spacing.small,
            padding: spacing.extraSmall,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            weight="book"
            size="xs"
            style={{ color: colors.ehkamGrey, marginStart: placeholder ? spacing.extraSmall : 0 }}
            text={placeholder}
          />
          <Text
            weight="bold"
            size="xs"
            style={{
              color: disabled ? colors.ehkamGrey : colors.ehkamCyan,
              marginHorizontal: spacing.extraSmall,
            }}
            text={selectedOpt}
          />
        </View>
      </ModalSelector>
    </View>
  )
}

const $contentContainer: ViewStyle = {
  alignContent: "center",
  paddingHorizontal: spacing.large,
  marginTop: spacing.small,
  paddingBottom: Dimensions.get("screen").height * 0.2,
}
