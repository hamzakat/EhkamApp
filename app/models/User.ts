import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import { ApiUserResponse } from "../services/api"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
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
    class_id: types.maybeNull(types.string),
    school_id: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const fetchCurrentUser = flow(function* () {
      try {
        const response = yield self.request({ method: "GET", url: "/users/me" })

        const currentUser: ApiUserResponse = {
          id: response.data.data.id,
          first_name: response.data.data.first_name,
          last_name: response.data.data.last_name,
          role: response.data.data.role,
          title: response.data.data.title,
          location: response.data.data.location,
          description: response.data.data.description,
          class_id: response.data.data.class_id,
          school_id: response.data.data.school_id,
        }

        return { kind: "ok", currentUser }
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${e}`, e.stack)
          console.log("Error from UserModel.fetchCurrentUser():", e)
        }

        return { kind: "bad-data" }
      }
    })

    return { fetchCurrentUser }
  })

export interface User extends Instance<typeof UserModel> {}
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
