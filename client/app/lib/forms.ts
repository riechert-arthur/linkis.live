import axios from "axios"
import { toast } from "sonner"

export function handleSubmitError(err: unknown) {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const payload = err.response.data
      const msg =
        typeof payload === "string"
          ? payload.trim()
          : payload?.message || JSON.stringify(payload)
      toast.error(msg)
    } else {
      toast.error(
        "We couldn't reach the server. Please check your connection and try again."
      )
    }
  } else {
    toast.error("An unexpected error occurred")
  }
  console.error(err)
}
