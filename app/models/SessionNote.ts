import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const SessionNoteModel = types
  .model("SessionNote")
  .props({
    _id: types.identifier,
    id: types.optional(types.string, ""),
    verse_number: types.string,
    chapter_number: types.string,
    page_number: types.string,
    tajweed: types.optional(types.boolean, false),
    pronunciation: types.optional(types.boolean, false),
    memorization: types.optional(types.boolean, false),
    text: types.maybeNull(types.string),
    session_id: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AyahNote extends Instance<typeof SessionNoteModel> {}
export interface AyahNoteSnapshotOut extends SnapshotOut<typeof SessionNoteModel> {}
export interface AyahNoteSnapshotIn extends SnapshotIn<typeof SessionNoteModel> {}
export const createAyahNoteDefaultModel = () => types.optional(SessionNoteModel, {})
