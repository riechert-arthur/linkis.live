import { RegistrationForm } from "~/components/forms/registration-form"
import { expect, describe, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { waitFor, cleanup, render, screen } from "@testing-library/react"

vi.mock("~/lib/forms")

type Fields = {
  name: string
  email: string
  password: string
  passwordVerification: string
}

async function fillAndSubmitForm({
  name,
  email,
  password,
  passwordVerification,
}: Fields) {
  const user = userEvent.setup()
  const [nameInput, emailInput, passwordInput, verifyInput] =
    screen.getAllByRole("textbox")

  if (name) await user.type(nameInput, name)
  else await user.clear(nameInput)

  if (email) await user.type(emailInput, email)
  else await user.clear(emailInput)

  if (password) await user.type(passwordInput, password)
  else await user.clear(passwordInput)

  if (passwordVerification) await user.type(verifyInput, passwordVerification)
  else await user.clear(verifyInput)

  await user.click(screen.getByRole("button", { name: /register/i }))
}

describe("registration form", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("requires user to enter a name", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "",
      email: "jane@example.com",
      password: "LongEnough!123",
      passwordVerification: "LongEnough!123",
    })
    expect(await screen.findByText("Please enter a name.")).toBeInTheDocument()
  })

  it("rejects names with non-letter characters", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane123",
      email: "jane@example.com",
      password: "LongEnough!123",
      passwordVerification: "LongEnough!123",
    })
    expect(
      await screen.findByText("Only letters are allowed.")
    ).toBeInTheDocument()
  })

  it("requires user to enter an email", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "",
      password: "LongEnough!123",
      passwordVerification: "LongEnough!123",
    })
    expect(await screen.findByText("Please enter an email")).toBeInTheDocument()
  })

  it("requires a valid email", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "not-an-email",
      password: "LongEnough!123",
      passwordVerification: "LongEnough!123",
    })
    expect(
      await screen.findByText("Please enter a valid email")
    ).toBeInTheDocument()
  })

  it("requires a password", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "",
      passwordVerification: "",
    })
    expect(
      await screen.findByText("Please enter a password")
    ).toBeInTheDocument()
  })

  it("requires a longer password", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "short1!",
      passwordVerification: "short1!",
    })
    expect(
      await screen.findByText("Please enter a longer password")
    ).toBeInTheDocument()
  })

  it("requires a non‐letter/non‐digit character in the password", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "LongPassword1234",
      passwordVerification: "LongPassword1234",
    })
    expect(
      await screen.findByText(
        "Please include one non-letter, non-digit character"
      )
    ).toBeInTheDocument()
  })

  it("requires matching password verification", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "LongEnough!123",
      passwordVerification: "Different!123",
    })
    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument()
  })

  it("resets the form upon successful submit", async () => {
    render(<RegistrationForm />)
    await fillAndSubmitForm({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "123456789123456789AR#",
      passwordVerification: "123456789123456789AR#",
    })

    await waitFor(() => {
      const [n, e, p, v] = screen.getAllByRole("textbox")
      expect(n).toHaveValue("")
      expect(e).toHaveValue("")
      expect(p).toHaveValue("")
      expect(v).toHaveValue("")
    })
  })
})
