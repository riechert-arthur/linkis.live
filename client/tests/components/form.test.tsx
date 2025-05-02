import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NewURLMappingForm } from "~/components/ui/new-url-mapping-form"
import userEvent from "@testing-library/user-event"

vi.mock("axios")
import axios from "axios"
import type { Mocked } from "vitest"
const axiosMock = axios as Mocked<typeof axios>

vi.mock("sonner")
import { toast, Toaster } from "sonner"

const successResponse = {
  data: { id: 1 },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {},
}

export async function fillAndSubmitForm(url: string, slug: string) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText("https://example.com"), url)
  await user.type(screen.getByPlaceholderText("panda-bear"), slug)
  await user.click(screen.getByRole("button", { name: /submit/i }))
}

export function renderToasterAndForm() {
  render(
    <>
      <Toaster />
      <NewURLMappingForm />
    </>
  )
}

describe("add url mapping workflow", () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("shows the error toast when axios throws", async () => {
    const err = {
      isAxiosError: true,
      response: { status: 500, data: "Server is down" },
    } as const
    axiosMock.post.mockRejectedValueOnce(err)

    renderToasterAndForm()

    fillAndSubmitForm("https://example.com", "my-slug")

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server is down")
    })
  })

  it("falls back to default message if error has no message", async () => {
    axiosMock.post.mockRejectedValueOnce({ isAxiosError: true })

    renderToasterAndForm()

    fillAndSubmitForm("https://example.com", "my-slug")

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "We couldn't reach the server. Please check your connection and try again."
      )
    })
  })

  it("shows required-field errors when you submit empty form", async () => {
    render(<NewURLMappingForm />)
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))
    expect(await screen.findByText("Please provide a URL")).toBeInTheDocument()
    expect(await screen.findByText("Please provide a slug")).toBeInTheDocument()
    expect(axiosMock.post).not.toHaveBeenCalled()
  })

  it("shows invalid-url errors when an incorrect url is submitted", async () => {
    render(<NewURLMappingForm />)

    fillAndSubmitForm("not-url", "ok-slug")

    expect(await screen.findByText("Invalid url")).toBeInTheDocument()
  })

  it("replaces the submit button with the loader while submitting", async () => {
    axiosMock.post.mockResolvedValueOnce(new Promise(() => {}))

    renderToasterAndForm()

    fillAndSubmitForm("https://example.com", "test")

    const loader = await screen.findByRole("button", {
      name: /generating new url/i,
    })
    expect(loader).toBeDisabled()

    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull()
  })

  it("doesn’t trigger a second axios if you click again while loading", async () => {
    const axiosSpy = vi
      .spyOn(axiosMock, "post")
      .mockResolvedValueOnce(successResponse)

    renderToasterAndForm()

    fillAndSubmitForm("https://example.com", "test-slug")

    const loader = await screen.findByRole("button", {
      name: /generating new url/i,
    })
    expect(axiosSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(loader)

    expect(axiosSpy).toHaveBeenCalledTimes(1)
  })

  it("submits successfully, resets inputs, and doesn’t show an error toast", async () => {
    const axiosSpy = vi
      .spyOn(axiosMock, "post")
      .mockResolvedValueOnce(successResponse)

    renderToasterAndForm()

    fillAndSubmitForm("https://foo.com", "ok-slug")

    vi.useFakeTimers()
    await vi.advanceTimersByTimeAsync(500)
    vi.useRealTimers()

    expect(screen.getByPlaceholderText("https://example.com")).toHaveValue("")
    expect(screen.getByPlaceholderText("panda-bear")).toHaveValue("")

    expect(toast.success).toHaveBeenCalledWith("Shortening successful!")
    expect(axiosSpy).toHaveBeenCalledTimes(1)
  })

  it("falls back to the generic message for non-axios errors", async () => {
    axiosMock.post.mockRejectedValueOnce(new Error("boom"))

    renderToasterAndForm()

    fillAndSubmitForm("https://foo.com", "ok-slug")

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred")
    })
  })
})
