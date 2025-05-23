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
import { toast } from "sonner"
import { addURLMapping } from "~/lib/url"
import { handleSubmitError } from "~/lib/forms"
import { LoadingButton } from "../wrappers/loading-button"

const urlMappingSchema = z.object({
  long: z
    .string()
    .nonempty({ message: "Please provide a URL" })
    .url({ message: "Invalid url" }),
  slug: z.string().nonempty({ message: "Please provide a slug" }),
})

export function NewURLMappingForm() {
  const form = useForm<z.infer<typeof urlMappingSchema>>({
    resolver: zodResolver(urlMappingSchema),
    defaultValues: {
      long: "",
      slug: "",
    },
  })

  async function onSubmit(values: z.infer<typeof urlMappingSchema>) {
    try {
      await addURLMapping({ short: values.slug, long: values.long })
      toast.success("Shortening successful!")
      form.reset()

      /* TODO: Navigate to a management page */
    } catch (err: unknown) {
      handleSubmitError(err)
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
          name="long"
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
          <LoadingButton>Generating new URL</LoadingButton>
        )}
      </form>
    </Form>
  )
}
