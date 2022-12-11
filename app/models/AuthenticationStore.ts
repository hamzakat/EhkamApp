import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"

import { api, ApiLoginResponse } from "../services/api"
import { GeneralApiProblem } from "../services/api/apiProblem"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { UserModel, UserSnapshotIn } from "./User"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authEmail: types.optional(types.string, ""),
    authPassword: types.optional(types.string, ""),
    authToken: types.maybe(types.string),
    authRefreshToken: types.maybe(types.string), // this was not included in demo
    authExpires: types.maybe(types.number),
    authState: types.optional(types.enumeration("State", ["pending", "done", "error"]), "done"),
    currentUser: types.maybe(UserModel),
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },
    get validationErrors() {
      return {
        authEmail: (function () {
          if (store.authEmail.length === 0) return "can't be blank"
          if (store.authEmail.length < 6) return "must be at least 6 characters"
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.authEmail))
            return "must be a valid email address"
          return ""
        })(),
        authPassword: (function () {
          if (store.authPassword.length === 0) return "can't be blank"
          if (store.authPassword.length < 6) return "must be at least 6 characters"
          return ""
        })(),
      }
    },
  }))
  .actions(withSetPropAction)
  .actions((store) => ({
    setAuthEmail(value: string) {
      store.authEmail = value.replace(/ /g, "")
    },
    setAuthPassword(value: string) {
      store.authPassword = value.replace(/ /g, "")
    },
    logout() {
      store.authToken = undefined
      store.authEmail = ""
      store.authPassword = ""
      store.authRefreshToken = undefined
      store.authExpires = undefined
      api.setAuthToken(undefined)
      api.setRefreshToken(undefined)
    },
  }))
  .actions((store) => ({
    fetchCurrentUser: flow(function* () {
      const result: { kind: "ok"; currentUser: UserSnapshotIn } | GeneralApiProblem =
        yield api.getCurrentUser()

      if (result.kind === "ok") {
        store.setProp("currentUser", UserModel.create(result.currentUser))
      } else {
        store.setProp("currentUser", undefined)
        __DEV__ && console.tron.log(result)
        console.log("fetchCurrentUser:", result)
      }
    }),
  }))
  .actions((store) => ({
    // this will run only if there's no validation errors
    login: flow(function* () {
      store.setProp("authState", "pending")
      const result: { kind: "ok"; loginResponse: ApiLoginResponse } | GeneralApiProblem =
        yield api.login(store.authEmail, store.authPassword)

      if (result.kind === "ok") {
        store.setProp("authState", "done")
        store.setProp("authToken", result.loginResponse.accessToken)
        store.setProp("authExpires", result.loginResponse.expires)
        store.setProp("authRefreshToken", result.loginResponse.refreshToken)

        // get user info after the successful login
        yield store.fetchCurrentUser()
      } else {
        store.setProp("authState", "error")
        __DEV__ && console.tron.log(result)
      }
      return result
    }),
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
