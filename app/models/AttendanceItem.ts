import {
  getRoot,
  Instance,
  resolveIdentifier,
  SnapshotIn,
  SnapshotOut,
  types,
} from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Student, StudentModel } from "./Student"

/**
 * Model description here for TypeScript hints.
 */
export const AttendanceItemModel = types
  .model("AttendanceItem")
  .props({
    student_id: types.optional(types.string, ""),
    present: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get studentObject(): undefined | Student {
      const root = getRoot(self)
      return resolveIdentifier(StudentModel, root, self.student_id)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    toggle: function () {
      self.present = !self.present
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AttendanceItem extends Instance<typeof AttendanceItemModel> {}
export interface AttendanceItemSnapshotOut extends SnapshotOut<typeof AttendanceItemModel> {}
export interface AttendanceItemSnapshotIn extends SnapshotIn<typeof AttendanceItemModel> {}
export const createAttendanceItemDefaultModel = () => types.optional(AttendanceItemModel, {})
