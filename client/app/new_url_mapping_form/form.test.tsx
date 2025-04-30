import "@testing-library/jest-dom"

import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { NewURLMappingForm } from "./form"
import { toast, Toaster } from "sonner"

vi.mock("sonner", () => {
  return {
    toast: vi.fn(),
    Toaster: (props: any) => <div data-testid="toaster" {...props} />,
  }
})

const fetchMock = vi.fn() as Mock
global.fetch = fetchMock

describe("NewURLMappingForm", () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("shows the error toast when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Server is down"))

    render(
      <>
        <Toaster />
        <NewURLMappingForm />
      </>
    )

    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("panda-bear"), {
      target: { value: "my-slug" },
    })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Server is down")
    })
  })

  it("falls back to default message if error has no message", async () => {
    fetchMock.mockRejectedValueOnce({})

    render(
      <>
        <Toaster />
        <NewURLMappingForm />
      </>
    )

    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("panda-bear"), {
      target: { value: "my-slug" },
    })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        "We couldn't reach the server. Please check your connection and try again."
      )
    })
  })

  it("shows required-field errors when you submit empty form", async () => {
    render(<NewURLMappingForm />)
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))
    expect(await screen.findByText("Please provide a URL")).toBeInTheDocument()
    expect(await screen.findByText("Please provide a slug")).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows invalid-url errors when an incorrect url is submitted", async () => {
    render(<NewURLMappingForm />)

    const oldUrlInput = screen.getByPlaceholderText("https://example.com")
    fireEvent.change(oldUrlInput, {
      target: { value: "12345-not-url" },
    })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    expect(await screen.findByText("Invalid url")).toBeInTheDocument()
  })

  it("replaces the submit button with the loader while submitting", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 200 })
    )

    render(
      <>
        <Toaster />
        <NewURLMappingForm />
      </>
    )

    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("panda-bear"), {
      target: { value: "test" },
    })

    vi.useRealTimers()

    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    const loader = await screen.findByRole("button", {
      name: /generating new url/i,
    })
    expect(loader).toBeDisabled()

    expect(screen.queryByRole("button", { name: /submit/i })).toBeNull()

    vi.useFakeTimers()
    await vi.advanceTimersByTimeAsync(500)

    vi.useRealTimers()

    const submit = await screen.findByRole("button", { name: /submit/i })
    expect(submit).toBeEnabled()
  })

  it("doesn’t trigger a second fetch if you click again while loading", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 })
      )

    render(
      <>
        <Toaster />
        <NewURLMappingForm />
      </>
    )

    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("panda-bear"), {
      target: { value: "test-slug" },
    })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    const loader = await screen.findByRole("button", {
      name: /generating new url/i,
    })
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(loader)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("submits successfully, resets inputs, and doesn’t show an error toast", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 99 }), { status: 200 })
      )

    render(
      <>
        <Toaster />
        <NewURLMappingForm />
      </>
    )
    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://foo.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("panda-bear"), {
      target: { value: "ok-slug" },
    })
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    await screen.findByRole("button", { name: /submit/i })

    vi.useFakeTimers()
    await vi.advanceTimersByTimeAsync(500)
    vi.useRealTimers()

    expect(screen.getByPlaceholderText("https://example.com")).toHaveValue("")
    expect(screen.getByPlaceholderText("panda-bear")).toHaveValue("")

    expect(toast).not.toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
