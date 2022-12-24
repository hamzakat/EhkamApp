import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  ActivityIndicator,
  ImageStyle,
  Keyboard,
  RefreshControl,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native"

import {
  Button,
  Icon,
  Screen,
  TextField,
  Text,
  Card,
  AutoImage,
  EmptyState,
  Toggle,
  ListItem,
} from "../../components"
import { useStores } from "../../models"
import { colors, spacing } from "../../theme"
import { FlatList } from "react-native-gesture-handler"
import { Student } from "../../models/Student"
import { delay } from "../../utils/delay"
import MultiSlider from "@ptomasroos/react-native-multi-slider"
import CustomLabel from "../../components/Slider/CustomLabel"
import { TeacherTabScreenProps } from "../../navigators/TeacherNavigator"

interface SortOptions {
  sortType: "alphabet" | "attendence" | "reciting" | "registration"
  order: "asc" | "desc"
}

interface FilterOptions {
  filterType:
    | "all"
    | "missed-last-session"
    | "good-attendence"
    | "good-reciting"
    | "at-juz"
    | "total-hifz"
  totalHifz?: number
  atJuz?: number
}

export const StudentsScreen: FC<TeacherTabScreenProps<"Students">> = observer(
  function StudentsScreen() {
    // Pull in one of our MST stores
    const { studentStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()

    const [isLoading, setIsLoading] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    const [searchPhrase, setSearchPhrase] = useState("")
    const [refreshing, setRefreshing] = useState(false)
    const [showFilterSettings, setShowFilterSettings] = useState(false)
    const [showSortSettings, setShowSortSettings] = useState(false)
    const [sort, setSort] = useState<SortOptions>({ sortType: "alphabet", order: "asc" })
    const [filter, setFilter] = useState<FilterOptions>({
      filterType: "all",
      atJuz: 30,
      totalHifz: 1,
    })
    const searchBarRef = useRef(undefined)

    // initially, kick off a background refresh without the refreshing UI
    useEffect(() => {
      ;(async function load() {
        setIsLoading(true)
        await studentStore.fetchStudents()
        setIsLoading(false)
      })()

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

    const renderItem = ({ item }: { item: Student }) => {
      if (searchPhrase === "") {
        return <StudentCard key={item.id} student={item} />
      }
      // filter of the name
      if (item.fullname.includes(searchPhrase.trim().replace(/\s/g, ""))) {
        return <StudentCard key={item.id} student={item} />
      }
    }

    return (
      <Screen safeAreaEdges={["top", "bottom"]} style={$root} preset="fixed">
        {/* Students list & Search Area */}
        {!(showFilterSettings || showSortSettings) && (
          <View>
            <TouchableWithoutFeedback onPress={() => searchBarRef.current.blur()}>
              <FlatList<Student>
                /* Search area */
                ListHeaderComponent={
                  <SearchArea
                    searchFocused={searchFocused}
                    setSearchFocused={setSearchFocused}
                    setSearchPhrase={setSearchPhrase}
                    searchBarRef={searchBarRef}
                    setShowSortSettings={setShowSortSettings}
                    setShowFilterSettings={setShowFilterSettings}
                  />
                }
                contentContainerStyle={$contentContainer}
                data={studentStore.students}
                refreshing={refreshing}
                onRefresh={manualRefresh}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => manualRefresh()} />
                }
                renderItem={renderItem}
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
            <View style={$container}>
              <Button
                preset="reversed"
                text="إضافة طالب"
                style={$addStudentButton}
                onPress={async function () {
                  // got to add student screen
                }}
              />
            </View>
          </View>
        )}
        {showSortSettings && (
          <SortSettings setShowSortSettings={setShowSortSettings} setSort={setSort} sort={sort} />
        )}
        {showFilterSettings && (
          <FilterSettings
            setShowFilterSettings={setShowFilterSettings}
            setFilter={setFilter}
            filter={filter}
          />
        )}
      </Screen>
    )
  },
)

const SearchArea = function ({
  searchBarRef,
  searchFocused,
  setSearchPhrase,
  setSearchFocused,
  setShowFilterSettings,
  setShowSortSettings,
}) {
  return (
    <View style={$searchArea}>
      {!searchFocused && (
        <View style={$searchIcons}>
          <Icon onPress={() => setShowSortSettings(true)} style={$searchIcon} icon="sortCyan" />

          <Icon onPress={() => setShowFilterSettings(true)} style={$searchIcon} icon="filterCyan" />
        </View>
      )}
      <View style={searchFocused ? $searchBarFocused : $searchBarBlurred}>
        <TextField
          ref={searchBarRef}
          RightAccessory={() => {
            return <Icon icon="searchCyan" style={$searchBarIcon} />
          }}
          inputWrapperStyle={$inputWrapper}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={"اسم الطالب ..."}
          placeholderTextColor={colors.ehkamGrey}
          onChangeText={(value) => setSearchPhrase(value)}
        />
      </View>
    </View>
  )
}

const RadioToggle = function ({ label, selected, onPress }) {
  return (
    <Toggle
      onPress={onPress}
      variant="radio"
      label={label}
      LabelTextProps={{ size: "sm", weight: "book" }}
      labelStyle={selected ? { color: colors.ehkamPeach } : { color: colors.ehkamGrey }}
      value={selected}
      containerStyle={{ marginBottom: spacing.medium }}
      inputOuterStyle={{
        width: 15,
        height: 15,
        justifyContent: "center",
        borderColor: colors.ehkamPeach,
        backgroundColor: colors.background,
      }}
      inputInnerStyle={{
        backgroundColor: colors.background,
      }}
      inputDetailStyle={{
        backgroundColor: colors.ehkamPeach,
        width: 7.75,
        height: 7.75,
        borderRadius: 25,
      }}
    />
  )
}

const SortSettings = function ({
  sort,
  setSort,
  setShowSortSettings,
}: {
  sort: SortOptions
  setSort: any
  setShowSortSettings: any
}) {
  const [tempSort, setTempSort] = useState<SortOptions>(sort)
  return (
    <View style={[$contentContainer, {}]}>
      {/* Title */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: spacing.medium,
          paddingVertical: spacing.small,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Icon style={$searchIcon} icon="sortPeach" />
          <Text
            style={{ marginLeft: spacing.extraSmall, color: colors.ehkamGrey }}
            weight="semiBold"
            size="md"
            text="ترتيب بحسب"
          />
        </View>
        <Icon
          onPress={() => setShowSortSettings(false)}
          style={{ width: 8 }}
          icon="leftArrowCyan"
        />
      </View>
      <View style={{ margin: spacing.medium }}>
        <RadioToggle
          label="الأحرف الأبجدية"
          selected={tempSort.sortType === "alphabet"}
          onPress={() => setTempSort({ ...tempSort, sortType: "alphabet" })}
        />
        <RadioToggle
          label="الالتزام بالدوام"
          selected={tempSort.sortType === "attendence"}
          onPress={() => setTempSort({ ...tempSort, sortType: "attendence" })}
        />
        <RadioToggle
          label="الالتزام بالتسميع"
          selected={tempSort.sortType === "reciting"}
          onPress={() => setTempSort({ ...tempSort, sortType: "reciting" })}
        />
        <RadioToggle
          label="تاريخ التسجيل"
          selected={tempSort.sortType === "registration"}
          onPress={() => setTempSort({ ...tempSort, sortType: "registration" })}
        />
      </View>
      <View style={{ margin: spacing.medium }}>
        <ListItem
          text="تصاعدي"
          TextProps={{ size: "sm", weight: "book" }}
          textStyle={{
            color: tempSort.order === "asc" ? colors.ehkamPeach : colors.ehkamGrey,
            marginLeft: spacing.medium,
          }}
          LeftComponent={
            <Icon
              style={{ width: 14 }}
              color={tempSort.order === "asc" ? colors.ehkamPeach : colors.ehkamGrey}
              icon="upArrowsGrey"
            />
          }
          style={{ alignItems: "center" }}
          onPress={() => setTempSort({ ...tempSort, order: "asc" })}
        />
        <ListItem
          text="تنازلي"
          TextProps={{ size: "sm", weight: "book" }}
          textStyle={{
            color: tempSort.order === "desc" ? colors.ehkamPeach : colors.ehkamGrey,
            marginLeft: spacing.medium,
          }}
          LeftComponent={
            <Icon
              style={{ width: 14 }}
              color={tempSort.order === "desc" ? colors.ehkamPeach : colors.ehkamGrey}
              icon="downArrowsGrey"
            />
          }
          style={{ alignItems: "center" }}
          onPress={() => setTempSort({ ...tempSort, order: "desc" })}
        />
      </View>

      <View style={{ flexDirection: "row" }}>
        <Button
          style={{
            flex: 0.5,
            borderRadius: 12,
            margin: spacing.tiny,
            backgroundColor: colors.ehkamGrey,
            borderWidth: 0,
          }}
          onPress={() => {
            setTempSort(sort)
            setShowSortSettings(false)
          }}
        >
          <Text
            text="تراجع"
            style={{ marginLeft: spacing.extraSmall, color: colors.background }}
            weight="semiBold"
            size="md"
          />
        </Button>
        <Button
          style={{
            flex: 0.5,
            borderRadius: 12,
            margin: spacing.tiny,
            backgroundColor: colors.ehkamPeach,
            borderWidth: 0,
          }}
          onPress={() => {
            setSort(tempSort)
            setShowSortSettings(false)
          }}
        >
          <Text
            text="حفظ"
            style={{ marginLeft: spacing.extraSmall, color: colors.background }}
            weight="semiBold"
            size="md"
          />
        </Button>
      </View>
    </View>
  )
}

const FilterSettings = function ({
  filter,
  setFilter,
  setShowFilterSettings,
}: {
  filter: FilterOptions
  setFilter: any
  setShowFilterSettings: any
}) {
  const [tempFilter, setTempFilter] = useState<FilterOptions>(filter)

  return (
    <View style={[$contentContainer, {}]}>
      {/* Title */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: spacing.medium,
          paddingVertical: spacing.small,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Icon style={$searchIcon} icon="filterPeach" />
          <Text
            style={{ marginLeft: spacing.extraSmall, color: colors.ehkamGrey }}
            weight="semiBold"
            size="md"
            text="إظهار الطلاب بحسب"
          />
        </View>
        <Icon
          onPress={() => setShowFilterSettings(false)}
          style={{ width: 8 }}
          icon="leftArrowCyan"
        />
      </View>
      <View style={{ margin: spacing.medium }}>
        <RadioToggle
          label="لم يسمّعوا الدرس الماضي"
          selected={tempFilter.filterType === "missed-last-session"}
          onPress={() => setTempFilter({ ...tempFilter, filterType: "missed-last-session" })}
        />
        <RadioToggle
          label="كل الطلاب"
          selected={tempFilter.filterType === "all"}
          onPress={() => setTempFilter({ ...tempFilter, filterType: "all" })}
        />
        <RadioToggle
          label="الملتزمون بالدوام"
          selected={tempFilter.filterType === "good-attendence"}
          onPress={() => setTempFilter({ ...tempFilter, filterType: "good-attendence" })}
        />
        <RadioToggle
          label="الملتزمون بالتسميع"
          selected={tempFilter.filterType === "good-reciting"}
          onPress={() => setTempFilter({ ...tempFilter, filterType: "good-reciting" })}
        />
        <RadioToggle
          label="طلاب في الجزء"
          selected={tempFilter.filterType === "at-juz"}
          onPress={() => setTempFilter({ ...tempFilter, filterType: "at-juz" })}
        />

        <View style={{ justifyContent: "center", alignItems: "center", marginTop: spacing.medium }}>
          <Text
            size="sm"
            weight="book"
            style={{
              color: colors.ehkamGrey,
            }}
            text={"طلاب يحفظون أجزاء عدد"}
          />
          <MultiSlider
            min={1}
            max={30}
            step={1}
            containerStyle={{ marginTop: spacing.medium }}
            markerStyle={{ backgroundColor: colors.ehkamCyan }}
            selectedStyle={{ backgroundColor: colors.ehkamCyan }}
            unselectedStyle={{ backgroundColor: colors.ehkamDarkGrey }}
            isMarkersSeparated={true}
            values={[tempFilter.totalHifz]}
            sliderLength={270}
            onValuesChange={(values) => setTempFilter({ ...tempFilter, totalHifz: values[0] })}
            enableLabel
            customLabel={CustomLabel}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: spacing.medium,
          }}
        >
          <Text size="xs" style={{ color: colors.ehkamDarkGrey }} text="1"></Text>
          <Text size="xs" style={{ color: colors.ehkamDarkGrey }} text="30"></Text>
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <Button
          style={{
            flex: 0.5,
            borderRadius: 12,
            margin: spacing.tiny,
            backgroundColor: colors.ehkamGrey,
            borderWidth: 0,
          }}
          onPress={() => {
            setTempFilter(filter)
            setShowFilterSettings(false)
          }}
        >
          <Text
            text="تراجع"
            style={{ marginLeft: spacing.extraSmall, color: colors.background }}
            weight="semiBold"
            size="md"
          />
        </Button>
        <Button
          style={{
            flex: 0.5,
            borderRadius: 12,
            margin: spacing.tiny,
            backgroundColor: colors.ehkamPeach,
            borderWidth: 0,
          }}
          onPress={() => {
            setFilter(tempFilter)
            setShowFilterSettings(false)
          }}
        >
          <Text
            text="حفظ"
            style={{ marginLeft: spacing.extraSmall, color: colors.background }}
            weight="semiBold"
            size="md"
          />
        </Button>
      </View>
    </View>
  )
}

const StudentCard = observer(function StudentCard({ student }: { student: Student }) {
  const studentImg = require("../../../assets/images/boy.jpeg")
  const handlePressCard = () => {
    // open student profile page
  }
  return (
    <Card
      style={$studentCard}
      verticalAlignment="center"
      onPress={() => handlePressCard()}
      LeftComponent={<AutoImage style={$studentCardAvatar} source={studentImg} />}
      RightComponent={
        <View style={$studentCardCircle}>
          <Text weight="bold" style={{ color: colors.background }} size="xxs">
            013
          </Text>
        </View>
      }
      HeadingComponent={
        <Text size="md" weight="bold" style={{ color: colors.ehkamDarkGrey }}>
          {student.fullname}
        </Text>
      }
      ContentComponent={
        <View style={$studentCardInfo}>
          <Text weight="book" style={{ color: colors.ehkamGrey }}>
            سورة البقرة
          </Text>
          <Text weight="book" style={{ color: colors.ehkamPeach }}>
            ص 30
          </Text>
        </View>
      }
    />
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $container: ViewStyle = {
  paddingHorizontal: spacing.large,
  marginBottom: spacing.medium,
  justifyContent: "space-around",
}

const $searchArea: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginVertical: spacing.medium,
}

const $searchBarBlurred: ViewStyle = {
  flex: 0.75,
}

const $searchBarFocused: ViewStyle = {
  flex: 1,
}

const $searchIcons: ViewStyle = {
  flex: 0.25,
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
}
const $searchIcon: ImageStyle = {
  width: 14,
}

const $searchBarIcon: ImageStyle = {
  width: 18,
  top: 6,
  right: 12,
}

const $inputWrapper: ViewStyle = {
  borderColor: colors.ehkamPeach,
  borderRadius: 12,
  borderWidth: 1,
}

const $studentCard: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  borderRadius: 20,
  borderWidth: 0,
  alignItems: "center",
  padding: 0,
  height: 100,
  marginTop: spacing.small,
}

const $studentCardAvatar: ImageStyle = {
  alignSelf: "center",
  borderRadius: 20,
  width: 100,
  height: 100,
}
const $studentCardInfo: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: 130,
}

const $studentCardCircle: ViewStyle = {
  backgroundColor: colors.ehkamCyan,
  width: 25,
  height: 25,
  borderRadius: 25,
  justifyContent: "space-around",
  alignItems: "center",
  paddingVertical: spacing.tiny,
  marginHorizontal: spacing.small,
}

const $addStudentButton: ViewStyle = {
  backgroundColor: colors.ehkamPeach,
  borderRadius: 20,
}
const $contentContainer: ViewStyle = {
  alignContent: "center",
  paddingHorizontal: spacing.large,
  paddingBottom: spacing.large,
}
