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
        url: `/users?filter[role][_eq]=${Config.DIRECTUS_STUDENT_ROLE_ID}&filter[class_student][class_id][_eq]=${root.currentUserStore.user.class_id}&fields=id,date_created,first_name,last_name,avatar,email,s_birthdate,s_edu_grade,s_edu_school,city,location,s_blood,s_health_issues,s_parent_job,s_social_issues,school_id,class_student.inclass_id,class_student.class_id,s_previous_memo`,
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

          // class_student is an array of the classes in which the student registerd
          inclass_id: raw.class_student[0]?.inclass_id,
          class_id: raw.class_student[0]?.class_id,
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
