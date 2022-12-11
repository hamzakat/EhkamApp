/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import axios, { AxiosInstance } from "axios"
import type { ApiConfig } from "./api.types"

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
  axios: AxiosInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.axios = axios.create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
    // this.apisauce.addAsyncResponseTransform(async (response) => {
    //   console.log("addAsyncResponseTransform", response.status)

    //   if (response.status === 401) {
    //     console.log("REFRESH TOKEN")

    //     this.apisauce.setHeaders({
    //       Authorization: undefined,
    //     })

    //     console.log("HEADERS", this.apisauce.headers)
    //     // get new refresh token
    //     const refreshResponse: ApiResponse<any> = await this.apisauce.post(
    //       "/auth/refresh",
    //       {
    //         refresh_token: this.refreshToken,
    //       },
    //       {
    //         ...response.config,
    //         headers: {
    //           Authorization: undefined,
    //         },
    //       },
    //     )

    //     if (!refreshResponse.ok) {
    //       console.log("!refreshResponse.ok")
    //       this.authToken = undefined
    //       this.refreshToken = undefined
    //       this.apisauce.setHeaders({
    //         Authorization: undefined,
    //       })
    //     } else {
    //       this.authToken = refreshResponse.data.data.access_token
    //       this.refreshToken = refreshResponse.data.data.refresh_token

    //       this.apisauce.setHeaders({
    //         Authorization: `Bearer ${this.authToken}`,
    //       })

    //       // retry the call that was failure
    //       const retryResponse = await this.apisauce.any({
    //         ...response.config,
    //         headers: {
    //           Authorization: `Bearer ${this.authToken}`,
    //         },
    //       })

    //       response.data = retryResponse.data
    //       response.status = retryResponse.status
    //       response.ok = retryResponse.ok
    //       response.problem = retryResponse.problem
    //     }
    //   }
    // })
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
