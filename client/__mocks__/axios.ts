import { vi } from "vitest"
import type { AxiosError } from "axios"

const post = vi.fn()
const get = vi.fn()
const isAxiosError = (e: any): e is AxiosError => Boolean(e?.isAxiosError)

const axios = {
  create: vi.fn(() => axios),
  post,
  get,
  isAxiosError,
}

export default axios
export { post, get, isAxiosError }
