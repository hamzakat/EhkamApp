import { ApiResponse } from "apisauce"
import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import { ApiUserResponse } from "../services/api"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { NotificationItemModel } from "./NotificationItem"
import { UserModel } from "./User"

export const CurrentUserStoreModel = types
  .model("User")
  .extend(withRequest)
  .props({
    user: types.optional(UserModel, {}),
    notifications: types.optional(types.array(NotificationItemModel), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const fetchCurrentUser = flow(function* () {
      const res: ApiResponse<any> = yield self.request({ method: "GET", url: "/users/me" })

      if (!res.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
        if (problem) {
          console.tron.error(`Bad data: ${problem}\n${res.data}`, problem)
          console.log("Problem from UserModel.fetchCurrentUser():", problem)
          // return problem
        }
      }
      try {
        const userData: ApiUserResponse = {
          id: res.data.data.id,
          first_name: res.data.data.first_name,
          last_name: res.data.data.last_name,
          role: res.data.data.role,
          title: res.data.data.title,
          location: res.data.data.location,
          description: res.data.data.description,
          class_id: res.data.data.class_id,
          school_id: res.data.data.school_id,
        }
        self.user = UserModel.create(userData)
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${res}`, e.stack)
          console.log("Error from UserModel.fetchCurrentUser():", e)
        }

        // return { kind: "bad-data" }
      }
    })

    const cleanCurrentUser = function () {
      self.user.id = ""
      self.user.first_name = ""
      self.user.last_name = ""
      self.user.role = ""
      self.user.title = ""
      self.user.location = ""
      self.user.description = ""
      self.user.class_id = ""
      self.user.school_id = ""
    }
    return { fetchCurrentUser, cleanCurrentUser }
  })

export interface CurrentUser extends Instance<typeof UserModel> {}
export interface CurrentUserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface CurrentUserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
