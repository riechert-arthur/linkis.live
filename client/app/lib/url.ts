import axios from "axios"

const ADD_MAPPING_ENDPOINT = "/api/add_url_mapping"

export interface URLMappingGetResponse {
  long: string
}

export interface URLMappingPostRequestBody {
  short: string
  long: string
}

export interface URLMappingPostResponse {
  message: string
  short: string
  long: string
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_REST_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function addURLMapping(
  payload: URLMappingPostRequestBody
): Promise<URLMappingPostResponse> {
  const { data } = await apiClient.post<URLMappingPostResponse>(
    ADD_MAPPING_ENDPOINT,
    payload
  )
  return data
}

export async function getURLMapping(
  slug: string
): Promise<URLMappingGetResponse> {
  const { data } = await apiClient.get<URLMappingGetResponse>(`/${slug}`)
  return data
}
