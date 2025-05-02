import type { Route } from "./+types/home"
import GlobeInit from "~/components/wrappers/globe-init"
import { motion } from "motion/react"
import { useEffect, useState, memo } from "react"
import { Progress } from "~/components/ui/progress"
import { Label } from "~/components/ui/label"
import { Loader2 } from "lucide-react"
import { getURLMapping } from "~/lib/url"
import { computeProgress } from "~/lib/utils"

const MAX_COUNTDOWN = 5 // seconds

const MemoGlobe = memo(GlobeInit)

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your Link is Live" },
    { name: "description", content: "Redirect is in progress!" },
  ]
}

export default function SlugRedirect({ params }: { params: { slug: string } }) {
  const [target, setTarget] = useState<string | null>(null)
  const [timer, setTimer] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      try {
        const { long } = await getURLMapping(params.slug)
        setTarget(long)
      } catch (e) {
        console.error("Failed to fetch redirect URL", e)
        setTarget("")
      }
    })()
  }, [params.slug])

  useEffect(() => {
    if (!target) {
      return
    }

    const start = performance.now()
    let rafId: number

    const tick = (now: number) => {
      const s = (now - start) / 1000
      if (s >= MAX_COUNTDOWN) {
        window.location.replace(target)
        return
      }
      setTimer(s)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => clearInterval(rafId)
  }, [target])

  const progress = computeProgress(timer, MAX_COUNTDOWN)

  return (
    <div className="relative flex h-screen w-full flex-row items-center justify-center bg-white py-20 dark:bg-black">
      <div className="relative mx-auto h-full w-full max-w-7xl overflow-hidden px-4 md:h-[40rem]">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="div"
        >
          <h2 className="text-center text-xl font-bold text-black md:text-4xl dark:text-white">
            Your connecting link
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-base font-normal text-neutral-700 md:text-lg dark:text-neutral-200">
            We're routing you to your destination. Please hold on tight and
            enjoy the extra snacks we've prepared!
          </p>
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-40 w-full bg-gradient-to-b from-transparent to-white select-none dark:to-black" />
        <div className="absolute -bottom-20 z-10 h-72 w-full md:h-full">
          <MemoGlobe />
        </div>
      </div>
      <div className="absolute bottom-20 left-1/2 z-900 flex w-150 -translate-x-1/2 flex-col items-center">
        <Label className="mb-10 text-lg">
          <Loader2 className="animate-spin" />
          {Math.ceil(progress)}%
        </Label>
        <Progress value={progress} />
      </div>
    </div>
  )
}
