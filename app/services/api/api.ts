/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import { ApisauceInstance, create, ApiResponse } from "apisauce"
import Config from "../../config"
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
}

// Singleton instance of the API for convenience
export const api = new Api()
