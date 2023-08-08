import { ApiResponse } from "apisauce"
import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import { ApiUserResponse } from "../services/api"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { NotificationItemModel } from "./NotificationItem"
import { UserModel } from "./User"
import { TeacherClass, TeacherClassModel } from "./TeacherClass"

export const CurrentUserStoreModel = types
  .model("User")
  .extend(withRequest)
  .props({
    user: types.optional(UserModel, {}),
    teacher_id: types.maybeNull(types.string),
    notifications: types.optional(types.array(NotificationItemModel), []),
    entered: types.optional(types.boolean, false),
    currentClass: types.maybeNull(TeacherClassModel),
    assignedClasses: types.optional(types.array(TeacherClassModel), []),
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
          console.log("Problem from CurrentUserModel.fetchCurrentUser():", problem)
          return { kind: problem.kind }
        }
      }
      try {
        const rawData: ApiUserResponse = res.data.data

        // we should check whether the user belong to a school or not to prevent a null pointer exception
        const userData = {
          id: rawData.id,
          first_name: rawData.first_name,
          last_name: rawData.last_name,
          role: rawData.role,
          title: rawData.title,
          location: rawData.location,
          description: rawData.description,
          school_id: rawData.school_id?.id,
          school_name: rawData.school_id?.name,
        }
        self.user = UserModel.create(userData)
      } catch (error) {
        console.log("Error from CurrentUserModel.fetchCurrentUser():", error)
        return { kind: "bad-data" }
      }

      const teacherRes: ApiResponse<any> = yield self.request({
        method: "GET",
        url: `/items/teachers?filter[user_id][_eq]=${self.user.id}&fields=classes.id,classes.name,classes.mosque_id,classes.mosque_id.name,classes.mosque_id.id, id`,
      })

      if (!teacherRes.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
        if (problem) {
          console.tron.error(`Bad data: ${problem}\n${teacherRes.data}`, problem)
          console.log("Problem from CurrentUserModel.fetchCurrentUser():", problem)
          return { kind: problem.kind }
        }
      }

      try {
        const teacherData = teacherRes.data.data

        self.teacher_id = teacherData[0].id

        // Single class response example:

        // {
        //   "id": "7b160b66-a824-48f8-ac18-19671e43c8e7",
        //   "name": "حلقة تجريبية",
        //   "mosque_id": {
        //       "name": "مسجد Test",
        //       "id": "92b8a8c6-5b3c-4c0c-9dfe-6ef9e34e4670"
        //   }
        // }

        const assignedClasses = teacherData[0].classes
        self.assignedClasses = assignedClasses.map((c) => {
          return TeacherClassModel.create({
            id: c.id,
            name: c.name,
            mosque_id: c.mosque_id.id,
            mosque_name: c.mosque_id.name,
          })
        })
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${teacherRes}`, e.stack)
          console.log("Error from UserModel.fetchCurrentUser():", e)
        }

        return { kind: "bad-data" }
      }
      return { kind: "ok" }
    })

    const cleanCurrentUser = function () {
      self.user.id = ""
      self.user.first_name = ""
      self.user.last_name = ""
      self.user.role = ""
      self.user.title = ""
      self.user.location = ""
      self.user.description = ""
      self.user.school_id = ""
      self.entered = false
      self.currentClass = undefined
      self.assignedClasses = []
    }
    return { fetchCurrentUser, cleanCurrentUser }
  })

export interface CurrentUser extends Instance<typeof UserModel> {}
export interface CurrentUserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface CurrentUserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
