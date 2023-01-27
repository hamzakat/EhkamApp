import { ApiResponse } from "apisauce"
import { flow, getRoot, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { ApiUserResponse } from "../services/api"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
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
    // basic info
    id: types.identifier,
    inclass_id: types.maybeNull(types.number),
    date_created: types.maybeNull(types.string),
    first_name: types.maybeNull(types.string),
    last_name: types.maybeNull(types.string),
    email: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    // avatar_image: types.maybeNull(types.frozen()),
    s_birthdate: types.maybeNull(types.string),
    s_edu_grade: types.maybeNull(types.string),
    s_edu_school: types.maybeNull(types.string),
    city: types.maybeNull(types.string),
    location: types.maybeNull(types.string),
    s_blood: types.maybeNull(types.string),
    s_health_issues: types.maybeNull(types.string),
    s_parent_job: types.maybeNull(types.string),
    s_social_issues: types.maybeNull(types.string),

    // educational level
    previous_memo: types.optional(types.number, 0),
    memo: types.optional(types.number, 0),

    // other info
    class_id: types.maybeNull(types.string),
    school_id: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get totalMemo() {
      return self.previous_memo + self.memo
    },

    get age() {
      return self.s_birthdate // do the math
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
      studentAttendanceRecords.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      return studentAttendanceRecords
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Student extends Instance<typeof StudentModel> {}
export interface StudentSnapshotOut extends SnapshotOut<typeof StudentModel> {}
export interface StudentSnapshotIn extends SnapshotIn<typeof StudentModel> {}
export const createStudentDefaultModel = () => types.optional(StudentModel, {})
