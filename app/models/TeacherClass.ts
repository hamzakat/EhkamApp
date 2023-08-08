// ---
// patches:
//   - path: "app/models/RootStore.ts"
//     after: "from \"mobx-state-tree\"\n"
//     insert: "import { TeacherClassModel } from \"./TeacherClass\"\n"
//     skip: true
//   - path: "app/models/RootStore.ts"
//     after: "types.model(\"RootStore\").props({\n"
//     insert: "  teacherClass: types.optional(TeacherClassModel, {} as any),\n"
//     skip: true
//   - path: "app/models/index.ts"
//     append: "export * from \"./TeacherClass\"\n"
//     skip:
// ---
import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const TeacherClassModel = types
  .model("TeacherClass")
  .props({
    id: types.optional(types.string, ""),
    name: types.optional(types.string, ""),
    mosque_id: types.optional(types.string, ""),
    mosque_name: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TeacherClass extends Instance<typeof TeacherClassModel> {}
export interface TeacherClassSnapshotOut extends SnapshotOut<typeof TeacherClassModel> {}
export interface TeacherClassSnapshotIn extends SnapshotIn<typeof TeacherClassModel> {}
export const createTeacherClassDefaultModel = () => types.optional(TeacherClassModel, {})
