import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const urlMappingSchema = z.object({
  oldurl: z
    .string()
    .nonempty({ message: "Please provide a URL" })
    .url({ message: "Invalid url" }),
  slug: z.string().nonempty({ message: "Please provide a slug" }),
})

export function NewURLMappingForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof urlMappingSchema>>({
    resolver: zodResolver(urlMappingSchema),
    defaultValues: {
      oldurl: "",
      slug: "",
    },
  })

  async function onSubmit(values: z.infer<typeof urlMappingSchema>) {
    console.log(values)

    try {
      /* TODO: Call API to add new URLs */
      const todo = await fetch(
        "https://jsonplaceholder.typicode.com/todos/1"
      ).then((r) => r.json())
      await new Promise((resolve) => setTimeout(resolve, 500)) // For testing loading UI
    } catch (err: any) {
      toast(
        err?.message ||
          "We couldn't reach the server. Please check your connection and try again."
      )
      console.error(err)
    } finally {
      form.reset()
      /* TODO: Redirect to new form or page to manage URLs */
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="oldurl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old URL</FormLabel>
              <FormControl className="bg-background border">
                <div className="bg-background flex w-full items-center rounded-md border">
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    className="flex-1 rounded-r-md border-0 bg-transparent"
                  />
                </div>
              </FormControl>
              <FormDescription>
                An active URL that you want to shorten.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom URL</FormLabel>
              <FormControl>
                <div className="bg-background flex w-full items-center rounded-md border">
                  <span className="text-muted-foreground px-3 text-sm">
                    https://linkis.live/
                  </span>
                  <Input
                    {...field}
                    className="flex-1 rounded-r-md border-0 bg-transparent"
                    placeholder="panda-bear"
                  />
                </div>
              </FormControl>
              <FormDescription>
                This will become{" "}
                <code>https://linkis.live/&lt;your-slug&gt;</code>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!form.formState.isSubmitting && (
          <Button className="hover:cursor-pointer" type="submit">
            Submit
          </Button>
        )}
        {form.formState.isSubmitting && (
          <Button disabled type="submit">
            <Loader2 className="animate-spin" />
            Generating new URL
          </Button>
        )}
      </form>
    </Form>
  )
}
