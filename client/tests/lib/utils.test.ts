import { vi, describe, it, beforeEach } from "vitest"
import { computeProgress } from "~/lib/utils"

describe("lib/utils", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("compute the progress", () => {
    it("calculates correct values for a normal range of input", async () => {
      expect(computeProgress(4, 5)).toEqual(80)
      expect(computeProgress(10, 100)).toEqual(10)
      expect(computeProgress(1, 10)).toEqual(10)
    })

    it("calculates the correct values for negative inputs", async () => {
      expect(computeProgress(-1, 2)).toEqual(0)
      expect(computeProgress(1, -2)).toEqual(100)
      expect(computeProgress(-1, -2)).toEqual(100)
    })

    it("calculates the correct values for timer > max", async () => {
      expect(computeProgress(10, 2)).toEqual(100)
    })
  })
})
