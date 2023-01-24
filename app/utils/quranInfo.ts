/* This file cotnains helper functions to get Quran text using numbers of pages, verses, or chapters */

export const getChapterTitle = (chapterNumber: number): string => {
  if (chapterNumber > 0 && chapterNumber <= 114) {
    const chaptersIndex: any[] = require("../../assets/data/quranjson/chapters.json")
    return chaptersIndex[chapterNumber].titleAr
  } else return undefined
}
