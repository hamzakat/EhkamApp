import { getRoot, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { SessionNoteModel } from "./SessionNote"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Student } from "./Student"

/**
 * Model description here for TypeScript hints.
 */
export const SessionModel = types
  .model("Session")
  .props({
    _id: types.identifier, // local tree's id
    id: types.optional(types.string, ""), // server id
    student_id: types.string,
    type: types.enumeration(["new", "repeat", "exam"]),
    start_page: types.number,
    start_chapter: types.number,
    start_verse: types.number,
    end_page: types.number,
    end_chapter: types.number,
    end_verse: types.number,
    notes: types.optional(types.array(SessionNoteModel), []),
    timestamp: types.string,
    grade: types.maybeNull(types.number),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get studentName() {
      const root = getRoot(self)
      const student: Student = root.studentStore.students.find(
        (student) => student.id === self.student_id,
      )
      return student.fullname
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Session extends Instance<typeof SessionModel> {}
export interface SessionSnapshotOut extends SnapshotOut<typeof SessionModel> {}
export interface SessionSnapshotIn extends SnapshotIn<typeof SessionModel> {}
export const createSessionDefaultModel = () => types.optional(SessionModel, {})
