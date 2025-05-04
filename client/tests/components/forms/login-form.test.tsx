import { LoginForm } from "~/components/forms/login-form"
import { expect, describe, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { cleanup, render, screen } from "@testing-library/react"

vi.mock("~/lib/forms")

async function fillAndSubmitForm({ email, password }: Record<string, string>) {
  const user = userEvent.setup()
  const emailInput = screen.getByLabelText(/email/i)
  const passwordInput = screen.getByLabelText(/password/i)

  if (email !== "") {
    await user.type(emailInput, email)
  } else {
    await user.clear(emailInput)
  }

  if (password !== "") {
    await user.type(passwordInput, password)
  } else {
    await user.clear(passwordInput)
  }

  await user.click(screen.getByRole("button", { name: "Login" }))
}

describe("login form", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("requires user to enter an email", async () => {
    render(<LoginForm />)
    await fillAndSubmitForm({ email: "", password: "12341231241231241231234#" })
    expect(await screen.findByText("Please enter an email")).toBeInTheDocument()
  })

  it("requires user to enter a valid email", async () => {
    render(<LoginForm />)
    await fillAndSubmitForm({
      email: "arthur",
      password: "12341231241231241231234#",
    })
    expect(
      await screen.findByText("Please enter a valid email")
    ).toBeInTheDocument()
  })

  it("requires the user to enter a password", async () => {
    render(<LoginForm />)
    await fillAndSubmitForm({ email: "jdoe@email.com", password: "" })
    expect(
      await screen.findByText("Please enter a password")
    ).toBeInTheDocument()
  })

  it("resets the form upon submit", async () => {
    render(<LoginForm />)
    await fillAndSubmitForm({
      email: "jdoe@email.com",
      password: "12341283719823781892371#",
    })
    expect(screen.getByLabelText(/email/i)).toHaveValue("")
    expect(screen.getByLabelText(/password/i)).toHaveValue("")
  })
})
