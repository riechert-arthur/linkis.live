import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { toast } from "sonner"
import { handleSubmitError } from "~/lib/forms"

vi.mock("sonner")

describe("handleSubmitError", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // restore the real axios.isAxiosError between tests
    vi.restoreAllMocks()
  })

  it("displays generic message for non-Axios errors", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(false)

    handleSubmitError(new Error("foo"))

    expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred")
  })

  it("displays connectivity message if axios error has no response", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    const err = {} as any

    handleSubmitError(err)

    expect(toast.error).toHaveBeenCalledWith(
      "We couldn't reach the server. Please check your connection and try again."
    )
  })

  it("displays payload.message when present", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    const err = { response: { data: { message: "Bad credentials" } } } as any

    handleSubmitError(err)

    expect(toast.error).toHaveBeenCalledWith("Bad credentials")
  })

  it("trims string payload before showing", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    const err = { response: { data: "  Oops!  " } } as any

    handleSubmitError(err)

    expect(toast.error).toHaveBeenCalledWith("Oops!")
  })

  it("JSON.stringify() non-string, non-message payload", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    const payload = { foo: "bar" }
    const err = { response: { data: payload } } as any

    handleSubmitError(err)

    expect(toast.error).toHaveBeenCalledWith(JSON.stringify(payload))
  })
})
