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
    currentAttendanceRecordChanged: false,
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
          class_id: root.currentUserStore.currentClass.id,
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
        url: `/items/attendance?filter[class_id][_eq]=${root.currentUserStore.currentClass.id}&fields=id,timestamp,items.student_id,items.present`,
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

    const getRates = (filter: "total" | "week" | "month") => {
      const ONE_DAY = 24 * 60 * 60 * 1000
      const today = new Date()
      const attendanceStats = self.attendanceRecords
        .sort((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1))
        .filter((record) => {
          const attendanceRecordDate = new Date(record.timestamp)
          if (filter === "total") return true
          if (filter === "week") return today - attendanceRecordDate <= ONE_DAY * 7
          if (filter === "month") return today - attendanceRecordDate <= ONE_DAY * 30
        })
        .reduce(
          (acc, record) => {
            return {
              attendanceRate: acc.attendanceRate + record.getRate(),
              numberOfRecords: acc.numberOfRecords + 1,
            }
          },
          {
            attendanceRate: 0,
            numberOfRecords: 0,
          },
        )

      let _attendanceRate = 0
      if (attendanceStats.numberOfRecords > 0) {
        _attendanceRate = Math.round(
          attendanceStats.attendanceRate / attendanceStats.numberOfRecords,
        )
      }
      return _attendanceRate
    }

    const getRateByDate = (date: Date) => {
      const attendanceRecord = self.attendanceRecords.find(
        (record) =>
          new Date(record.timestamp).toISOString().substring(0, 10) ===
          date.toISOString().substring(0, 10),
      )
      if (attendanceRecord) {
        return attendanceRecord.getRate()
      }
      return 0
    }

    const clearAttendanceStore = () => {
      self.attendanceRecords.clear()
      self.recordsOfflineQueue.clear()
    }

    return { dequeue, getRates, getRateByDate, clearAttendanceStore }
  })

export interface AttendanceStore extends Instance<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotOut extends SnapshotOut<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotIn extends SnapshotIn<typeof AttendanceStoreModel> {}
export const createAttendanceStoreDefaultModel = () => types.optional(AttendanceStoreModel, {})
