/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import { ApisauceInstance, create, ApiResponse } from "apisauce"
import Config from "../../config"
import { UserSnapshotIn } from "../../models/User"
import type { ApiConfig, ApiLoginResponse } from "./api.types"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  authToken: string
  refreshToken: string

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
    this.apisauce.addAsyncResponseTransform(async (response) => {
      console.log("addAsyncResponseTransform", response.status)

      if (response.status === 401) {
        console.log("REFRESH TOKEN")

        this.apisauce.setHeaders({
          Authorization: undefined,
        })

        console.log("HEADERS", this.apisauce.headers)
        // get new refresh token
        const refreshResponse: ApiResponse<any> = await this.apisauce.post(
          "/auth/refresh",
          {
            refresh_token: this.refreshToken,
          },
          {
            ...response.config,
            headers: {
              Authorization: undefined,
            },
          },
        )

        if (!refreshResponse.ok) {
          console.log("!refreshResponse.ok")
          this.authToken = undefined
          this.refreshToken = undefined
          this.apisauce.setHeaders({
            Authorization: undefined,
          })
        } else {
          this.authToken = refreshResponse.data.data.access_token
          this.refreshToken = refreshResponse.data.data.refresh_token

          this.apisauce.setHeaders({
            Authorization: `Bearer ${this.authToken}`,
          })

          // retry the call that was failure
          const retryResponse = await this.apisauce.any({
            ...response.config,
            headers: {
              Authorization: `Bearer ${this.authToken}`,
            },
          })

          response.data = retryResponse.data
          response.status = retryResponse.status
          response.ok = retryResponse.ok
          response.problem = retryResponse.problem
        }
      }
    })
  }

  setAuthToken(authToken: string) {
    this.authToken = authToken
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ kind: "ok"; loginResponse: ApiLoginResponse } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.apisauce.post("/auth/login", {
      email: email,
      password: password,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    this.authToken = response.data.data.access_token
    this.refreshToken = response.data.data.refresh_token

    this.apisauce.setHeaders({
      Authorization: `Bearer ${this.authToken}`,
    })

    // transform login response
    try {
      const loginResponse: ApiLoginResponse = {
        accessToken: response.data.data.access_token,
        expires: response.data.data.expires,
        refreshToken: response.data.data.refresh_token,
      }

      return { kind: "ok", loginResponse }
    } catch (e) {
      if (__DEV__) {
        console.tron.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
        console.log("Error from api.ts:", e)
      }
      return { kind: "bad-data" }
    }
  }

  async getCurrentUser(): Promise<{ kind: "ok"; currentUser: UserSnapshotIn } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.apisauce.get("/users/me")
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
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

      return { kind: "ok", currentUser }
    } catch (e) {
      if (__DEV__) {
        console.tron.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
        console.log("Error from api.ts:", e)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
