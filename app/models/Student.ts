import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const StudentModel = types
  .model("Student")
  .extend(withRequest)
  .props({
    // basic info
    id: types.identifier,
    first_name: types.maybeNull(types.string),
    last_name: types.maybeNull(types.string),
    email: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    avatar_image: types.maybeNull(types.frozen()),
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
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Student extends Instance<typeof StudentModel> {}
export interface StudentSnapshotOut extends SnapshotOut<typeof StudentModel> {}
export interface StudentSnapshotIn extends SnapshotIn<typeof StudentModel> {}
export const createStudentDefaultModel = () => types.optional(StudentModel, {})
