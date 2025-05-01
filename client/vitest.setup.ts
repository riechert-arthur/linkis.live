;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.stubGlobal("console.error", () => {})
vi.stubGlobal("console.warn", () => {})
