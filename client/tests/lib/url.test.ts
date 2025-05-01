import { mock } from "node:test"
import { it, vi, describe, beforeEach } from "vitest"
import { apiClient, addURLMapping, getURLMapping } from "~/lib/url"

describe("lib/url", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("add url mapping call", () => {
    const payload = { short: "foo", long: "https://example.com" }

    it("POSTs to the right endpoint and return data", async () => {
      const mockData = { message: "ok", short: "foo", long: "https://example.com" }

      const postSpy = vi
        .spyOn(apiClient, "post")
        .mockResolvedValue({ data: mockData })

      const result = await addURLMapping(payload)

      expect(postSpy).toHaveBeenCalled()
      expect(postSpy).toHaveBeenCalledWith("/api/add_url_mapping", payload)
      expect(result).toEqual(mockData)
    })

    it("forwards errors when the request fails", async () => {
      const error = new Error("network down")
      vi.spyOn(apiClient, "post").mockRejectedValue(error)

      await expect(addURLMapping(payload)).rejects.toThrow("network down")
    })
  })

  describe("get url mapping call", () => {
    const slug = "ok-slug"

    it("GETs from the right URL and returns data", async () => {
      const mockData = { long: "https://foo.com" }
      const getSpy = vi
        .spyOn(apiClient, "get")
        .mockResolvedValue({ data: mockData })

      const result = await getURLMapping(slug)

      expect(getSpy).toHaveBeenCalled()
      expect(getSpy).toHaveBeenCalledWith(`/${slug}`)
      expect(result).toEqual(mockData)
    })

    it("forwards errors when the request fails", async () => {
      const err = new Error("404 not found")
      vi.spyOn(apiClient, "get").mockRejectedValue(err)

      await expect(getURLMapping(slug)).rejects.toThrow("404 not found")
    })
  })
})
