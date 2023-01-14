import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { AttendanceRecordModel } from "./AttendanceRecord"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const AttendanceStoreModel = types
  .model("AttendanceStore")
  .props({
    attendanceRecords: types.optional(types.array(AttendanceRecordModel), []),
    currentAttendanceRecord: types.maybeNull(AttendanceRecordModel),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AttendanceStore extends Instance<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotOut extends SnapshotOut<typeof AttendanceStoreModel> {}
export interface AttendanceStoreSnapshotIn extends SnapshotIn<typeof AttendanceStoreModel> {}
export const createAttendanceStoreDefaultModel = () => types.optional(AttendanceStoreModel, {})
