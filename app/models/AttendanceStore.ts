import { ApiResponse } from "apisauce"
import {
  flow,
  getRoot,
  getSnapshot,
  Instance,
  SnapshotIn,
  SnapshotOut,
  types,
} from "mobx-state-tree"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { AttendanceRecordModel, AttendanceRecordSnapshotOut } from "./AttendanceRecord"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"

const RecordsQueueItemModel = types.model({
  attendanceRecord: AttendanceRecordModel,
  problem: types.frozen(),
})

export interface RecordsQueueItem extends Instance<typeof RecordsQueueItemModel> {}

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

    const sendAttendanceRecord = flow(function* (attendanceRecord: AttendanceRecordSnapshotOut) {
      // do POST request for attendance record
      const req: ApiResponse<any> = yield self.request({
        method: "POST",
        url: `/items/attendance`,
        data: {
          items: attendanceRecord.items,
          class_id: root.currentUserStore.user.class_id,
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
        url: `/items/attendance?filter[class_id][_eq]=${root.currentUserStore.user.class_id}&fields=id,timestamp,items.student_id,items.present`,
      })
      if (!req.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(req)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${req.data}`, problem)
          __DEV__ &&
            console.log(
              "Problem from AttendanceStoreModel.fetchAttendanceRecords():",
              problem,
              "\n",
              req,
            )
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
      // for each item in the sessionOfflineQueue
      // do post request
      // if successful ->  set the id to the id recieved from the OK response & remvove item from sessionOfflineQueue

      const payload: AttendanceRecordSnapshotOut[] = self.recordsOfflineQueue.map((queueItem) => {
        return getSnapshot(queueItem.attendanceRecord)
      })

      self.recordsOfflineQueue.replace([])
      payload.forEach(async (record) => {
        try {
          await self.sendAttendanceRecord(record)
        } catch (error) {
          __DEV__ && console.log("Error from AttendanceStore.dequeue", error)
        }
      })
    })
    return { dequeue }
  })

export interface AttendanceStore extends Instance<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotOut extends SnapshotOut<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotIn extends SnapshotIn<typeof AttendanceStoreModel> {}
export const createAttendanceStoreDefaultModel = () => types.optional(AttendanceStoreModel, {})
