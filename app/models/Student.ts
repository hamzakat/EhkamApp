import { ApiResponse } from "apisauce"
import { flow, getRoot, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { ApiUserResponse } from "../services/api"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { AttendanceRecord } from "./AttendanceRecord"
import { AttendanceStore } from "./AttendanceStore"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Session } from "./Session"
import { SessionStore } from "./SessionStore"

/**
 * Model description here for TypeScript hints.
 */
export const StudentModel = types
  .model("Student")
  .extend(withRequest)
  .props({
    // basic info from directus_user
    id: types.identifier,
    date_created: types.maybeNull(types.string),
    first_name: types.maybeNull(types.string),
    last_name: types.maybeNull(types.string),
    email: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    // avatar_image: types.maybeNull(types.frozen()),
    school_id: types.maybeNull(types.string),

    location: types.maybeNull(types.string),

    inclass_id: types.maybeNull(types.number),
    class_id: types.maybeNull(types.string),
    birthdate: types.maybeNull(types.string),
    edu_grade: types.maybeNull(types.string),
    edu_school: types.maybeNull(types.string),
    city: types.maybeNull(types.string),
    blood: types.maybeNull(types.string),
    health_issues: types.maybeNull(types.string),
    parent_job: types.maybeNull(types.string),
    social_issues: types.maybeNull(types.string),

    // educational level
    previous_memo: types.maybeNull(types.number, 0),
    memo: types.optional(types.number, 0),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get currentMemo() {
      /* 
      - get all sessions
      - if sessions.length > 0: calculate the pagesCompleted
      - memo = pagesCompleted/20
      */

      let memo = 0
      let pagesCompleted = 0
      const sessionStore: SessionStore = getRoot(self).sessionStore
      const studentSessions = sessionStore.sessions.filter((session: Session) => {
        return session.student_id === self.id && session.type === "new"
      })
      if (studentSessions.length > 0) {
        studentSessions.forEach((session: Session) => {
          if (session.start_page !== session.end_page) {
            pagesCompleted = pagesCompleted + (session.end_page - session.start_page)
          } else {
            pagesCompleted = pagesCompleted + 1
          }
        })
        memo = Math.trunc(pagesCompleted / 20) // calculate the number of memo juz

        self.setProp("memo", memo)
        return memo
      } else {
        self.setProp("memo", 0)
        return 0
      }
    },

    get age() {
      return self.birthdate // TODO: do the math
    },

    get fullname() {
      if (self.last_name) {
        return self.first_name + " " + self.last_name
      }
      return self.first_name
    },
    get lastNewSession() {
      const sessionStore: SessionStore = getRoot(self).sessionStore
      const studentSessions = sessionStore.sessions.filter((session: Session) => {
        return session.student_id === self.id && session.type === "new"
      })

      const numberOfSessions = studentSessions.length
      if (numberOfSessions > 0) {
        studentSessions.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        return studentSessions[numberOfSessions - 1]
      } else return undefined
    },

    get lastRepeatSession() {
      const sessionStore: SessionStore = getRoot(self).sessionStore
      const studentSessions = sessionStore.sessions.filter((session: Session) => {
        return session.student_id === self.id && session.type === "repeat"
      })

      const numberOfSessions = studentSessions.length
      if (numberOfSessions > 0) {
        studentSessions.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        return studentSessions[numberOfSessions - 1]
      } else return undefined
    },
    get attendanceDays() {
      const attendanceStore: AttendanceStore = getRoot(self).attendanceStore
      let daysPresent = 0
      let daysAbsent = 0
      attendanceStore.attendanceRecords.forEach((record) => {
        const student = record.items.find((item) => item.student_id === self.id)
        if (student?.present) daysPresent++
        else daysAbsent++
      })
      const rate =
        daysAbsent > 0 || daysPresent > 0
          ? Math.trunc((daysPresent * 100) / (daysAbsent + daysPresent))
          : 0
      return { daysPresent, daysAbsent, rate }
    },
    get attendanceRecords() {
      const attendanceStore: AttendanceStore = getRoot(self).attendanceStore
      const studentAttendanceRecords = attendanceStore.attendanceRecords.reduce((acc, record) => {
        const item = record.items.find((item) => self.id === item.student_id)
        if (item) {
          acc.push({
            timestamp: record.timestamp.substring(0, 10),
            present: item.present,
          })
        }
        return acc
      }, [] as { timestamp: string; present: boolean }[])
      // sort the records list ASC
      studentAttendanceRecords.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      return studentAttendanceRecords
    },
    get recitingRate() {
      /* 
      get daysPresent
      get number of sessions
      number of missed sessions = number of present days - number of new session 
      if number of missed sessions > 0:
        rate = number of missed sessions * 100 / number of present days
        return rate
      else 
        return 100
      */
      let rate = 0
      // get daysPresent
      const attendanceStore: AttendanceStore = getRoot(self).attendanceStore
      let daysPresent = 0
      attendanceStore.attendanceRecords.forEach((record) => {
        const student = record.items.find((item) => item.student_id === self.id)
        if (student?.present) daysPresent++
      })

      if (daysPresent > 0) {
        // get number of sessions
        let numberOfSessions = 0
        const sessionStore: SessionStore = getRoot(self).sessionStore
        const studentSessions = sessionStore.sessions.filter((session: Session) => {
          return session.student_id === self.id && session.type === "new"
        })
        numberOfSessions = studentSessions.length
        const missedSessions = daysPresent - numberOfSessions
        if (missedSessions > 0) {
          rate = (missedSessions * 100) / daysPresent

          return rate
        } else return 100 // daysPresent =< numberOfSessions
      } else return 0
    },

    get missedLastSession() {
      const root = getRoot(self)

      const attendanceStore: AttendanceStore = root.attendanceStore
      const sessionStore: SessionStore = root.sessionStore
      const studentSessions = sessionStore.sessions.filter((session: Session) => {
        return session.student_id === self.id
      })

      let lastStudentSession: Session

      // get the last session instance
      const numberOfSessions = studentSessions.length
      if (numberOfSessions > 0) {
        studentSessions.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        lastStudentSession = studentSessions[numberOfSessions - 1]
      } else return undefined

      // get the last attendance record instance
      const sortedAttendance = attendanceStore.attendanceRecords
        .slice()
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      const lastAttendance: AttendanceRecord = sortedAttendance[sortedAttendance.length - 1]
      const studentInlastAttendance = lastAttendance.items.find(
        (item) => item.student_id === self.id,
      )

      // present in the last attendancerecord AND didn't make a session
      return studentInlastAttendance.present
        ? new Date(lastAttendance.timestamp.substring(0, 10)).getTime() >
            new Date(lastStudentSession.timestamp.substring(0, 10)).getTime()
        : false

      // FOR DEBUGGING
      // if (
      //   new Date(lastAttendance.timestamp.substring(0, 10)).getTime() >
      //   new Date(lastStudentSession.timestamp.substring(0, 10)).getTime()
      // ) {
      //   console.log("lastAttendance", lastAttendance.timestamp.substring(0, 10))
      //   console.log("last session", lastStudentSession.timestamp.substring(0, 10))
      //   console.log("studentInlastAttendance", studentInlastAttendance)
      // }

      // return (
      //   new Date(lastAttendance.timestamp.substring(0, 10)).getTime() >
      //   new Date(lastStudentSession.timestamp.substring(0, 10)).getTime()
      // )
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Student extends Instance<typeof StudentModel> {}
export interface StudentSnapshotOut extends SnapshotOut<typeof StudentModel> {}
export interface StudentSnapshotIn extends SnapshotIn<typeof StudentModel> {}
export const createStudentDefaultModel = () => types.optional(StudentModel, {})
