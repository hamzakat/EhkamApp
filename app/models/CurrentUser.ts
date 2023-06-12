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
    entered: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get isEntered() {
      return self.entered
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const fetchCurrentUser = flow(function* () {
      const res: ApiResponse<any> = yield self.request({
        method: "GET",
        url: "/users/me?fields=id,first_name,last_name,role,title,location,description,school_id.name,school_id.id",
      })

      if (!res.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
        if (problem) {
          console.tron.error(`Bad data: ${problem}\n${res.data}`, problem)
          console.log("Problem from UserModel.fetchCurrentUser():", problem)
          return
        }
      }
      try {
        const rawData: ApiUserResponse = res.data.data
        const userData = {
          id: rawData.id,
          first_name: rawData.first_name,
          last_name: rawData.last_name,
          role: rawData.role,
          title: rawData.title,
          location: rawData.location,
          description: rawData.description,
          school_id: rawData.school_id.id,
          class_id: null,
          school_name: rawData.school_id.name,
        }

        const classTeacherRes: ApiResponse<any> = yield self.request({
          method: "GET",
          url: `/items/teachers?filter[user_id][_eq]=${userData.id}&fields=classes,id`,
        })

        if (!classTeacherRes.ok) {
          const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
          if (problem) {
            console.tron.error(`Bad data: ${problem}\n${classTeacherRes.data}`, problem)
            console.log("Problem from UserModel.fetchCurrentUser():", problem)
            return
          }
        }

        const classTeacherData = classTeacherRes.data.data

        userData.class_id = classTeacherData[0].classes[0] // NOTE: teacher might be assigned to more class. this version get the 1st class id only

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
