import { GalleryVerticalEnd } from "lucide-react"
import { BackgroundBeams } from "~/components/ui/background-beams"
import { LoginForm } from "~/components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gray-950 p-6 md:p-10">
      <div className="z-1000 flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          LinkIs.live
        </a>
        <LoginForm />
      </div>
      <BackgroundBeams className="x-0 y-0 absolute" />
    </div>
  )
}
