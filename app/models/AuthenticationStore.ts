import { api, ApiLoginResponse } from "../services/api"
import { flow, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { UserModel, UserSnapshotIn } from "./User"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { ApiResponse } from "apisauce"

export const AuthenticationStoreModel = types
  .model("AuthStore", {
    accessToken: types.maybeNull(types.string),
    refreshToken: types.maybeNull(types.string),
    authEmail: types.optional(types.string, ""),
    authPassword: types.optional(types.string, ""),
    authState: types.optional(types.enumeration("State", ["pending", "done", "error"]), "done"),
    currentUser: types.maybe(UserModel),
  })
  .views((self) => ({
    get isAuthenticated() {
      return self.refreshToken !== null
    },
    get validationErrors() {
      return {
        authEmail: (function () {
          if (self.authEmail.length === 0) return "can't be blank"
          if (self.authEmail.length < 6) return "must be at least 6 characters"
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(self.authEmail))
            return "must be a valid email address"
          return ""
        })(),
        authPassword: (function () {
          if (self.authPassword.length === 0) return "can't be blank"
          if (self.authPassword.length < 6) return "must be at least 6 characters"
          return ""
        })(),
      }
    },
  }))
  .actions(withSetPropAction)
  .actions((self) => {
    const fetchCurrentUser = flow(function* () {
      const response: { kind: "ok"; currentUser: UserSnapshotIn } =
        yield self.currentUser.fetchCurrentUser()

      if (response.kind !== "ok") {
        console.log("fetchCurrentUser", response)
        return
      }

      try {
        self.currentUser = UserModel.create(response.currentUser)
        return { kind: "ok" }
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${response}`, e.stack)
          console.log("Error from AuthenticationStore.fetchCurrentUser():", e)
        }
        self.currentUser = undefined
        return { kind: "bad-data" }
      }
    })

    return { fetchCurrentUser }
  })
  .actions((self) => {
    let refreshTokensPromise = null
    const refreshTokens = flow(function* () {
      // No catch clause because we want the caller to handle the error.
      try {
        const res = yield api.axios({
          method: "POST",
          url: "/auth/refresh/",
          data: {
            refresh_token: self.refreshToken,
          },
          headers: {
            Authorization: undefined,
          },
        })

        self.accessToken = res.data.data.access_token
        self.refreshToken = res.data.data.refresh_token
        console.log("Successful refresh token!")
      } finally {
        refreshTokensPromise = null
      }
    })

    return {
      // Multiple requests could fail at the same time because of an old
      // accessToken, so we want to make sure only one token refresh
      // request is sent.
      refreshTokens() {
        if (refreshTokensPromise) return refreshTokensPromise

        refreshTokensPromise = refreshTokens()
        return refreshTokensPromise
      },
      logIn: flow(function* (email, password) {
        self.authState = "pending"
        try {
          const response: ApiResponse<any> = yield api.axios({
            method: "POST",
            url: "/auth/login/",
            data: {
              email,
              password,
            },
          })

          // transform login response
          const loginResponse: ApiLoginResponse = {
            accessToken: response.data.data.access_token,
            expires: response.data.data.expires,
            refreshToken: response.data.data.refresh_token,
          }

          self.authState = "done"
          self.accessToken = loginResponse.accessToken
          self.refreshToken = loginResponse.refreshToken

          // get user info after the successful login
          yield self.fetchCurrentUser()
          return { kind: "ok" }
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
      logOut() {
        self.accessToken = null
        self.refreshToken = null
        self.authEmail = ""
        self.authPassword = ""
      },
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

        try {
          return yield api.axios(authConf)
        } catch (error) {
          const { status } = error.response
          console.log("LOG STATUS", status)

          // Throw the error to the caller if it's not an authorization error.
          if (status !== 401) throw error

          try {
            yield self.refreshTokens()
          } catch (err) {
            // If refreshing of the tokens fail we have an old
            // refreshToken and we must log out the user.
            self.logOut()
            // We still throw the error so the caller doesn't
            // treat it as a successful request.
            throw err
          }

          authConf.headers.Authorization = `Bearer ${self.accessToken}`

          return yield api.axios(authConf)
        }
      }),
    }
  })

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshotIn
  extends SnapshotIn<typeof AuthenticationStoreModel> {}
export const createAuthenticationStoreDefaultModel = () =>
  types.optional(AuthenticationStoreModel, {})

// const SomeDeepModel = t
//   .model({
//     foo: "foo",
//   })
//   .extend(withRequest)
//   .actions((self) => ({
//     getFoo: flow(function* () {
//       const res = yield self.request({ url: "/api/foo/" })

//       self.foo = res.data.foo
//     }),
//   }))
