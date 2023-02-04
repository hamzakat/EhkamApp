import { ApiResponse } from "apisauce"
import { flow, getRoot, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"
import { withRequest } from "./helpers/withRequest"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    attendance_rate: types.optional(types.number, 80),
    session_rate: types.optional(types.number, 80),
  })
  .extend(withRequest)
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => {
    const root = getRoot(self)
    const fetchSchoolSettings = flow(function* () {
      // get settings from /items/schools/:id

      const res: ApiResponse<any> = yield self.request({
        method: "GET",
        url: `/items/schools/${root.currentUserStore.user.school_id}?fields=attendance_rate,session_rate`,
      })

      if (!res.ok) {
        const problem: void | GeneralApiProblem = getGeneralApiProblem(res)
        if (problem) {
          __DEV__ && console.tron.error(`Bad data: ${problem}\n${res.data}`, problem)
          __DEV__ && console.log("Problem from SettingStoreModel.fetchSchoolSettings():", problem)
          return
        }
      }
      try {
        const rawData = res.data.data

        self.setProp("attendance_rate", rawData.attendance_rate)
        self.setProp("session_rate", rawData.session_rate)
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${res}`, e.stack)
          __DEV__ && console.log("Error from SettingStoreModel.fetchSchoolSettings():", e)
        }
      }
    })

    return { fetchSchoolSettings }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SettingStore extends Instance<typeof SettingStoreModel> {}
export interface SettingStoreSnapshotOut extends SnapshotOut<typeof SettingStoreModel> {}
export interface SettingStoreSnapshotIn extends SnapshotIn<typeof SettingStoreModel> {}
export const createSettingStoreDefaultModel = () => types.optional(SettingStoreModel, {})
