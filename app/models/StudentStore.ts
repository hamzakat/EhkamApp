import { ApiResponse } from "apisauce"
import { Instance, SnapshotIn, SnapshotOut, types, flow, getRoot } from "mobx-state-tree"
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
    const root = getRoot(self)
    const fetchStudents = flow(function* () {
      const res: ApiResponse<any> = yield self.request({
        method: "GET",
        url: `/items/students?filter[class_id][_eq]=${root.currentUserStore.user.class_id}&fields=id,date_created,user_id.first_name,user_id.last_name,user_id.avatar,user_id.email,user_id.school_id,user_id.location,birthdate,edu_grade,edu_school,city,blood,health_issues,parent_job,social_issues,inclass_id,previous_memo`,
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
        // __DEV__ && console.log(rawData)

        const students: StudentSnapshotIn[] = rawData.map((raw) => ({
          id: raw.id,
          class_id: raw.class_id,
          date_created: raw.date_created,
          birthdate: raw.birthdate,
          edu_grade: raw.edu_grade,
          edu_school: raw.edu_school,
          city: raw.city,
          blood: raw.blood,
          health_issues: raw.health_issues,
          parent_job: raw.parent_job,
          social_issues: raw.social_issues,
          inclass_id: raw.inclass_id,
          previous_memo: raw.previous_memo,

          first_name: raw.user_id.first_name,
          last_name: raw.user_id.last_name,
          avatar: raw.user_id.avatar,
          email: raw.user_id.email,
          school_id: raw.user_id.school_id,
          location: raw.user_id.location,
        }))

        self.setProp("students", students)
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${res}`, e.stack)
          __DEV__ && console.log("Error from StudentModel.fetchStudents():", e)
        }
      }
    })

    const clearStudentStore = () => {
      self.students.clear()
    }
    return { fetchStudents, clearStudentStore }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface StudentStore extends Instance<typeof StudentStoreModel> {}
export interface StudentStoreSnapshotOut extends SnapshotOut<typeof StudentStoreModel> {}
export interface StudentStoreSnapshotIn extends SnapshotIn<typeof StudentStoreModel> {}
export const createStudentStoreDefaultModel = () => types.optional(StudentStoreModel, {})
