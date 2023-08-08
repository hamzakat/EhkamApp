import { api, ApiLoginResponse } from "../services/api"
import { flow, Instance, SnapshotIn, SnapshotOut, types, getRoot } from "mobx-state-tree"

import { withSetPropAction } from "./helpers/withSetPropAction"
import { ApiResponse } from "apisauce"
import { GeneralApiProblem, getGeneralApiProblem } from "../services/api/apiProblem"

export const AuthenticationStoreModel = types
  .model("AuthStore", {
    accessToken: types.maybeNull(types.string),
    refreshToken: types.maybeNull(types.string),
    authEmail: types.optional(types.string, ""),
    authPassword: types.optional(types.string, ""),
    authState: types.optional(types.enumeration("State", ["pending", "done", "error"]), "done"),
  })
  .views((self) => ({
    get isAuthenticated() {
      return self.refreshToken !== null && self.authState === "done" // wait for current user data to be fetched
    },
    get validationErrors() {
      return {
        authEmail: (function () {
          if (self.authEmail.length === 0) return "رجاء أدخل البريد الالكتروني"
          if (self.authEmail.length < 6) return "يجب أن يكون مؤلفاً من 6 أحرف فمافوق"
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(self.authEmail))
            return "تأكد من كتابة البريد الالكتروني بشكل صحيح"
          return ""
        })(),
        authPassword: (function () {
          if (self.authPassword.length === 0) return "رجاء أدخل كلمة المرور"
          if (self.authPassword.length < 6) return "يجب أن يكون مؤلفاً من 6 أحرف فمافوق"
          return ""
        })(),
      }
    },
  }))
  .actions(withSetPropAction)
  .actions((self) => {
    const rootStore = getRoot(self)
    return {
      logOut() {
        self.accessToken = null
        self.refreshToken = null
        self.authEmail = ""
        self.authPassword = ""

        // Clear all the stores
        // @ts-ignore
        rootStore.currentUserStore.cleanCurrentUser() // @ts-ignore
        rootStore.sessionStore.clearSessionStore() // @ts-ignore
        rootStore.studentStore.clearStudentStore() // @ts-ignore
        rootStore.attendanceStore.clearAttendanceStore() // @ts-ignore
        rootStore.settingStore.clearSettingStore()
        __DEV__ && console.log("Clear stores!")
      },

      refreshTokens() {
        // Multiple requests could fail at the same time because of an old
        // accessToken, so we want to make sure only one token refresh
        // request is sent.
        let refreshTokensPromise = null
        const refreshTokens = flow(function* () {
          // No catch clause because we want the caller to handle the error.

          const refreshTokenRes = yield api.apisauce.any({
            method: "POST",
            url: "/auth/refresh/",
            data: {
              refresh_token: self.refreshToken,
            },
            headers: {
              Authorization: undefined,
            },
          })

          if (!refreshTokenRes.ok) {
            const problem: void | GeneralApiProblem = getGeneralApiProblem(refreshTokenRes)
            __DEV__ &&
              console.log("Problem from AuthenticationStore.refreshTokens():", refreshTokenRes)

            if (problem) {
              // self.logOut()
              return problem
            }
          }
          try {
            self.accessToken = refreshTokenRes.data.data.access_token
            self.refreshToken = refreshTokenRes.data.data.refresh_token
            console.log("Successful refresh token!")
            refreshTokensPromise = null

            return { kind: "ok", refreshTokenRes }
          } catch (e) {
            if (__DEV__) {
              console.tron.error(`Bad data: ${e.message}\n${refreshTokenRes}`, e.stack)
              console.log("Error from AuthenticationStore.fetchCurrentUser():", e)
            }
            refreshTokensPromise = null
            return { kind: "bad-data" }
          }
        })
        if (refreshTokensPromise) return refreshTokensPromise

        refreshTokensPromise = refreshTokens()
        return refreshTokensPromise
      },
      logIn: flow(function* (email, password) {
        self.authState = "pending"
        const response: ApiResponse<any> = yield api.apisauce.any({
          method: "POST",
          url: "/auth/login/",
          data: {
            email,
            password,
          },
        })

        if (!response.ok) {
          const problem = getGeneralApiProblem(response)
          __DEV__ && console.log("Problem from AuthenticationStore.logIn()", response)

          if (problem) return problem
        }
        try {
          // transform login response
          const loginResponse: ApiLoginResponse = {
            accessToken: response.data.data.access_token,
            expires: response.data.data.expires,
            refreshToken: response.data.data.refresh_token,
          }

          self.accessToken = loginResponse.accessToken
          self.refreshToken = loginResponse.refreshToken

          // get user info after the successful login
          // @ts-ignore

          // execute rootStore.currentUserStore.fetchCurrentUser() and wait for it to finish before returning
          // @ts-ignore
          const currentUserFetching = yield rootStore.currentUserStore.fetchCurrentUser()
          if (currentUserFetching.kind === "ok") {
            self.authState = "done"
            return { kind: "ok" }
          } else {
            return { kind: "bad-data" }
          }
        } catch (e) {
          if (__DEV__) {
            console.tron.error(`Bad data: ${e.message}\n${e}`, e.stack)
            console.log("Error from AuthenticatioStore.login():", e)
          }
          self.authState = "error"
          __DEV__ && console.tron.log(e)
          return { kind: "bad-data" }
        }
      }),

      setAuthEmail(value: string) {
        self.authEmail = value.replace(/ /g, "")
      },
      setAuthPassword(value: string) {
        self.authPassword = value.replace(/ /g, "")
      },
    }
  })
  .actions((self) => {
    return {
      authRequest: flow(function* (conf) {
        const authConf = {
          ...conf,
          headers: {
            ...conf.headers,
            Authorization: `Bearer ${self.accessToken}`,
          },
        }

        const res = yield api.apisauce.any(authConf)

        if (res.ok) return res

        // Return the raw response to the caller if it's not an authorization error.
        if (res.status !== 401) return res

        const refreshTokenRes = yield self.refreshTokens()

        if (refreshTokenRes.kind !== "ok") {
          // If refreshing of the tokens fail we have an old
          // refreshToken and we must log out the user.
          self.logOut()
          // We still throw the error so the caller doesn't
          // treat it as a successful request.
          return refreshTokenRes
        }
        authConf.headers.Authorization = `Bearer ${self.accessToken}`

        return yield api.apisauce.any(authConf)
      }),
    }
  })

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshotIn
  extends SnapshotIn<typeof AuthenticationStoreModel> {}
export const createAuthenticationStoreDefaultModel = () =>
  types.optional(AuthenticationStoreModel, {})
