import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"

import { api, ApiLoginResponse } from "../services/api"
import { GeneralApiProblem } from "../services/api/apiProblem"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authEmail: types.optional(types.string, ""),
    authPassword: types.optional(types.string, ""),
    authRefreshToken: types.maybe(types.string), // this was not included in demo
    authExpires: types.maybe(types.number),
    authState: types.optional(types.enumeration("State", ["pending", "done", "error"]), "done"),
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
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setAuthEmail(value: string) {
      store.authEmail = value.replace(/ /g, "")
    },
    setAuthPassword(value: string) {
      store.authPassword = value.replace(/ /g, "")
    },
    setRefreshAuthToken(value?: string) {
      // this was not included in demo
      store.authRefreshToken = value
    },
    setAuthExpires(timeout: number) {
      store.authExpires = timeout
    },
    setAuthState(value: "pending" | "done" | "error") {
      store.authState = value
    },
    logout() {
      store.authToken = undefined
      store.authEmail = ""
      store.authPassword = ""
      store.authRefreshToken = undefined
      store.authExpires = undefined
    },
  }))
  .actions((store) => ({
    // this will run only if there's no validation errors
    login: flow(function* () {
      store.setAuthState("pending")
      const result: { kind: "ok"; loginResponse: ApiLoginResponse } | GeneralApiProblem =
        yield api.login(store.authEmail, store.authPassword)

      if (result.kind === "ok") {
        store.setAuthState("done")
        store.setAuthToken(result.loginResponse.accessToken)
        store.setAuthExpires(result.loginResponse.expires)
        store.setRefreshAuthToken(result.loginResponse.refreshToken)
      } else {
        store.setAuthState("error")
        __DEV__ && console.tron.log(result)
      }
      return result
    }),
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
