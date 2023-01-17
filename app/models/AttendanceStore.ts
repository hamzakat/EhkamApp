import { ApiResponse } from "apisauce"
import { flow, getRoot, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { AttendanceRecordModel, AttendanceRecordSnapshotOut } from "./AttendanceRecord"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { UserSnapshotOut } from "./User"

const RecordsQueueItemModel = types.model({
  attendanceRecord: AttendanceRecordModel,
  problem: types.frozen(),
})

export const AttendanceStoreModel = types
  .model("AttendanceStore")
  .props({
    attendanceRecords: types.optional(types.array(AttendanceRecordModel), []),
    currentAttendanceRecord: types.maybeNull(AttendanceRecordModel),
    recordsOfflineQueue: types.optional(types.array(RecordsQueueItemModel), []),
  })
  .extend(withRequest)
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const root = getRoot(self)
    // @ts-ignore
    const currentTeacherObj = root.currentUserStore.user as UserSnapshotOut
    const sendAttendanceRecord = flow(function* (attendanceRecord: AttendanceRecordSnapshotOut) {
      // do POST request for session
      const req: ApiResponse<any> = yield self.request({
        method: "POST",
        url: `/items/attendance`,
        data: {
          items: attendanceRecord.items,
          class_id: currentTeacherObj.class_id,
          timestamp: attendanceRecord.timestamp,
        },
      })
      if (!req.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(req)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${req.data}`, problem)
          __DEV__ &&
            console.log("Problem from AttendanceStoreModel.sendAttendanceRecord():", problem)

          // if network is offline -> add to queue
          self.recordsOfflineQueue.push(RecordsQueueItemModel.create({ attendanceRecord, problem }))
        }
      } else {
        // get server id and apply it to the props

        const id = req.data.data.id
        attendanceRecord.id = id

        const updatedItems = attendanceRecord.items.map((item) => {
          item.attendance_id = id
          return item
        })
        attendanceRecord.items = updatedItems

        self.attendanceRecords.push(attendanceRecord)
      }
    })
    const fetchAttendanceRecords = flow(function* () {
      const req: ApiResponse<any> = yield self.request({
        method: "GET",
        url: `/items/attendance?filter[class_id][_eq]=${currentTeacherObj.class_id}&fields=id,timestamp,items.student_id,items.present`,
      })
      if (!req.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(req)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${req.data}`, problem)
          __DEV__ &&
            console.log("Problem from AttendanceStoreModel.fetchAttendanceRecords():", problem)
        }
      } else {
        const attendanceRecords = req.data.data.map((record) => {
          return AttendanceRecordModel.create({
            _id: record.id,
            id: record.id,
            timestamp: record.timestamp,
            items: record.items,
          })
        })
        self.attendanceRecords = attendanceRecords
      }
    })
    return { sendAttendanceRecord, fetchAttendanceRecords }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const dequeue = flow(function* () {
      // for each item in the offline queue
      // do post request
      // if successful ->  set the id to the id recieved from the OK response & remvove item from sessionOfflineQueue
    })
    return { dequeue }
  })

export interface AttendanceStore extends Instance<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotOut extends SnapshotOut<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotIn extends SnapshotIn<typeof AttendanceStoreModel> {}
export const createAttendanceStoreDefaultModel = () => types.optional(AttendanceStoreModel, {})
