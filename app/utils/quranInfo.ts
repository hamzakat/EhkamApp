/* This file cotnains helper functions to get Quran text using numbers of pages, verses, or chapters */

export const getChapterTitle = (chapterNumber: number): string => {
  if (chapterNumber > 0 && chapterNumber <= 114) {
    const chaptersIndex: any[] = require("../../assets/data/quranjson/chapters.json")
    return chaptersIndex[chapterNumber].titleAr
  } else return undefined
}

export const getJuzNumber = (pageNumber: number): number => {
  if (pageNumber > 0 && pageNumber <= 604) {
    // TODO: add Juz number to each page data in muhsaf.json in order to use it for fetching Juz number using page number
    const muhsaf: any[] = require("../../assets/data/quranjson/muhsaf.json")
    return muhsaf[pageNumber].juzNumber
  } else return undefined
}

export const getFirstPageOfChapter = (chapterNumber: number): number => {
  if (chapterNumber > 0 && chapterNumber <= 114) {
    const chapters: any[] = require("../../assets/data/quranjson/chapters.json")
    return chapters[chapterNumber].pages
  } else return undefined
}
