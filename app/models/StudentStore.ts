import { ApiResponse } from "apisauce"
import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import Config from "../config"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { StudentModel, StudentSnapshotIn } from "./Student"

/**
 * Model description here for TypeScript hints.
 */
export const StudentStoreModel = types
  .model("StudentStore")
  .extend(withRequest)
  .props({
    students: types.optional(types.array(StudentModel), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const fetchStudentsAvatars = flow(function* () {
      // UNCOMPLETED
      self.students.forEach(async (student) => {
        if (student.avatar) {
          const res: ApiResponse<any> = await self.request({
            method: "GET",
            responseType: "json",
            forcedJSONParsing: false,
            silentJSONParsing: false,
            url: `/assets/${student.avatar}?${Config.AVATAR_QUERY_PRESETS}`,
          })
          if (!res.ok) {
            const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
            if (problem) {
              __DEV__ && console.tron.error(`Bad data: ${problem}\n${res.data}`, problem)
              __DEV__ && console.log("Problem from StudentModel.fetchStudentsAvatar():", problem)
              return
            }
          }

          try {
            // TODO: fetch blob/image and store it
          } catch (e) {
            console.log(e)
          }
        }
      })
    })

    return { fetchStudentsAvatars }
  })
  .actions((self) => {
    const fetchStudents = flow(function* () {
      const res: ApiResponse<any> = yield self.request({
        method: "GET",
        url: `/users?filter[role][_eq]=${Config.DIRECTUS_STUDENT_ROLE_ID}&fields=id,date_created,first_name,last_name,avatar,email,s_birthdate,s_edu_grade,s_edu_school,city,location,s_blood,s_health_issues,s_parent_job,s_social_issues,class_id,school_id`,
      })

      if (!res.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${res.data}`, problem)
          __DEV__ && console.log("Problem from StudentModel.fetchStudents():", problem)
          return
        }
      }
      try {
        const rawData = res.data.data

        const students: StudentSnapshotIn[] = rawData.map((raw) => ({
          ...raw,
        }))

        self.setProp("students", students)
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${res}`, e.stack)
          __DEV__ && console.log("Error from StudentModel.fetchStudents():", e)
        }
      }
    })

    return { fetchStudents }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface StudentStore extends Instance<typeof StudentStoreModel> {}
export interface StudentStoreSnapshotOut extends SnapshotOut<typeof StudentStoreModel> {}
export interface StudentStoreSnapshotIn extends SnapshotIn<typeof StudentStoreModel> {}
export const createStudentStoreDefaultModel = () => types.optional(StudentStoreModel, {})
