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

export default function SlugRedirect({
  params
}: {
  params: { slug: string }
}) {
  const [target, setTarget] = useState<string | null>(null)
  const [timer, setTimer] = useState<number>(0)

  useEffect(() => {
    (async () => {
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
    <div className="flex flex-row items-center justify-center py-20 h-screen dark:bg-black bg-white relative w-full">
      
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
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
          <h2 className="text-center text-xl md:text-4xl font-bold text-black dark:text-white">
            Your connecting link
          </h2>
          <p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
            We're routing you to your destination. Please hold on tight and enjoy the extra snacks we've prepared! 
          </p>
        </motion.div>
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-40" />
        <div className="absolute w-full -bottom-20 h-72 md:h-full z-10">
          <MemoGlobe />
        </div>
      </div>
      <div className="flex flex-col items-center left-1/2 -translate-x-1/2 bottom-20 absolute w-150 z-900">
        <Label className="mb-10 text-lg"><Loader2 className="animate-spin"/>{ Math.ceil(progress) }%</Label>
        <Progress value={ progress } />
      </div>
    </div>
  )
}
