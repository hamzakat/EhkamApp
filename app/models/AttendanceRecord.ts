import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { AttendanceItemModel } from "./AttendanceItem"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const AttendanceRecordModel = types
  .model("AttendanceRecord")
  .props({
    _id: types.identifier, // local tree id
    id: types.optional(types.string, ""), // server id
    items: types.optional(types.array(AttendanceItemModel), []),
    timestamp: types.string,
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    getRate() {
      const total = self.items.length
      const present = self.items.filter((item) => item.present).length
      return Math.round((present / total) * 100)
    },
    getNumberOfPresent() {
      return self.items.filter((item) => item.present).length
    },
    getDay() {
      return new Date(self.timestamp).getDate()
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AttendanceRecord extends Instance<typeof AttendanceRecordModel> {}
export interface AttendanceRecordSnapshotOut extends SnapshotOut<typeof AttendanceRecordModel> {}
export interface AttendanceRecordSnapshotIn extends SnapshotIn<typeof AttendanceRecordModel> {}
export const createAttendanceRecordDefaultModel = () => types.optional(AttendanceRecordModel, {})
