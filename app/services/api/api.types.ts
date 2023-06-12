/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */

export interface ApiLoginResponse {
  accessToken: string
  expires: number
  refreshToken: string
}

export interface ApiUserResponse {
  id: string
  first_name: string
  last_name: string
  role: string
  title: string
  location: string
  description: string
  school_id: {
    id: string
    name: string
  }
}
/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
