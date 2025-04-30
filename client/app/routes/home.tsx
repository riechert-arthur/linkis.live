import type { Route } from "./+types/home"
import { NewURLMappingForm } from "~/new_url_mapping_form/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { BackgroundBeams } from "~/components/ui/background-beams"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export default function Home() {
  return (
    <div className="antialased relative flex min-h-screen w-full items-center justify-center dark:bg-gray-950">
      <Card className="z-50 h-fit w-1/2">
        <CardHeader>
          <CardTitle>Create a new URL mapping...</CardTitle>
          <CardDescription>
            Input your old mapping and your new mapping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewURLMappingForm />
        </CardContent>
      </Card>
      <BackgroundBeams className="x-0 y-0 absolute" />
    </div>
  )
}
