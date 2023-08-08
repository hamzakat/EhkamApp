import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const UserModel = types
  .model("User")
  .extend(withRequest)
  .props({
    id: types.maybeNull(types.string),
    first_name: types.maybeNull(types.string),
    last_name: types.maybeNull(types.string),
    location: types.maybeNull(types.string),
    title: types.maybeNull(types.string),
    description: types.maybeNull(types.string),
    role: types.maybeNull(types.string),
    school_id: types.maybeNull(types.string),
    school_name: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get fullname() {
      if (self.last_name) {
        return self.first_name + " " + self.last_name
      }
      return self.first_name
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface User extends Instance<typeof UserModel> {}
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
