import { vi } from "vitest"
import type { ReactNode } from "react"

export const error = vi.fn()
export const success = vi.fn()

export const toast = { error, success }

export function Toaster(props: { children?: ReactNode }) {
  return <div data-testid="toaster">{ props.children }</div>
}
