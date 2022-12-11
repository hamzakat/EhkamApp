import { ApiResponse } from "apisauce"
import { flow, Instance, SnapshotOut, types, getEnv } from "mobx-state-tree"

import { ApiLoginResponse } from "../services/api"
import { getGeneralApiProblem } from "../services/api/apiProblem"
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
      const api = getEnv(store).api.apisauce
      store.authToken = undefined
      store.authEmail = ""
      store.authPassword = ""
      store.authRefreshToken = undefined
      store.authExpires = undefined
      api.setHeader("Authorization", undefined)
    },
  }))
  .actions((store) => {
    const api = getEnv(store).api

    const fetchCurrentUser = flow(function* () {
      const response: ApiResponse<any> = yield api.apisauce.get("/users/me")
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) {
          console.tron.error(`Bad data: ${problem}\n${response.data}`, problem)
          console.log("Error from AuthenticationStore.fetchCurrentUser():", problem)
          return problem
        }
      }

      try {
        const currentUser: UserSnapshotIn = {
          id: response.data.data.id,
          first_name: response.data.data.first_name,
          last_name: response.data.data.last_name,
          role: response.data.data.role,
          title: response.data.data.title,
          location: response.data.data.location,
          description: response.data.data.description,
          class_id: response.data.data.class_id,
          school_id: response.data.data.school_id,
        }
        store.setProp("currentUser", UserModel.create(currentUser))

        return { kind: "ok" }
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
          console.log("Error from AuthenticationStore.fetchCurrentUser():", e)
        }
        store.setProp("currentUser", undefined)
        return { kind: "bad-data" }
      }
    })

    return { fetchCurrentUser }
  })
  .actions((store) => {
    // this will run only if there's no validation errors

    const api = getEnv(store).api

    const login = flow(function* () {
      store.setProp("authState", "pending")
      const response: ApiResponse<any> = yield api.apisauce.post("/auth/login", {
        email: store.authEmail,
        password: store.authPassword,
      })

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      try {
        // transform login response
        const loginResponse: ApiLoginResponse = {
          accessToken: response.data.data.access_token,
          expires: response.data.data.expires,
          refreshToken: response.data.data.refresh_token,
        }

        store.setProp("authState", "done")
        store.setProp("authToken", loginResponse.accessToken)
        store.setProp("authExpires", loginResponse.expires)
        store.setProp("authRefreshToken", loginResponse.refreshToken)

        api.apisauce.setHeader("Authorization", `Bearer ${loginResponse.accessToken}`)

        // get user info after the successful login
        yield store.fetchCurrentUser()
        return { kind: "ok" }
      } catch (e) {
        if (__DEV__) {
          console.tron.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
          console.log("Error from AuthenticatioStore.login():", e)
        }
        store.setProp("authState", "error")
        __DEV__ && console.tron.log(response)
        return { kind: "bad-data" }
      }
    })

    return { login }
  })

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
