// components/World.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, extend, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three"
import countries from "~/data/globe.json"

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElements["mesh"] & { new (): any }
  }
}

const RING_PROPAGATION_SPEED = 3
const aspect = 1.2
const cameraZ = 300

type Position = {
  order: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  arcAlt: number
  color: string
}

export type GlobeConfig = {
  pointSize?: number
  globeColor?: string
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereAltitude?: number
  emissive?: string
  emissiveIntensity?: number
  shininess?: number
  polygonColor?: string
  ambientLight?: string
  directionalLeftLight?: string
  directionalTopLight?: string
  pointLight?: string
  arcTime?: number
  arcLength?: number
  rings?: number
  maxRings?: number
  initialPosition?: { lat: number; lng: number }
  autoRotate?: boolean
  autoRotateSpeed?: number
}

interface WorldProps {
  globeConfig: GlobeConfig
  data: Position[]
}

export function GlobeWrapper({ globeConfig, data }: WorldProps) {
  const [ThreeGlobeLib, setThreeGlobeLib] = useState<any>(null)
  const globeRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Merge defaults + user config
  const defaultProps = {
    pointSize: 1,
    globeColor: "#1d072e",
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  }

  // 1️⃣ Dynamically import three-globe on client only
  useEffect(() => {
    let cancelled = false
    import("three-globe")
      .then((mod) => {
        if (cancelled) return
        const GlobeClass = mod.default
        extend({ ThreeGlobe: GlobeClass })
        setThreeGlobeLib(() => GlobeClass)
      })
      .catch((err) => console.error("three-globe import failed:", err))
    return () => {
      cancelled = true
    }
  }, [])

  // 2️⃣ Instantiate after import
  useEffect(() => {
    if (!ThreeGlobeLib || isInitialized || !groupRef.current) return
    globeRef.current = new ThreeGlobeLib()
    groupRef.current.add(globeRef.current)
    setIsInitialized(true)
  }, [ThreeGlobeLib, isInitialized])

  // 3️⃣ Update material when config changes
  useEffect(() => {
    if (!isInitialized || !globeRef.current) return
    const mat = globeRef.current.globeMaterial() as {
      color: Color
      emissive: Color
      emissiveIntensity: number
      shininess: number
    }
    mat.color = new Color(defaultProps.globeColor)
    mat.emissive = new Color(defaultProps.emissive)
    mat.emissiveIntensity = defaultProps.emissiveIntensity!
    mat.shininess = defaultProps.shininess!
  }, [
    isInitialized,
    defaultProps.globeColor,
    defaultProps.emissive,
    defaultProps.emissiveIntensity,
    defaultProps.shininess,
  ])

  // 4️⃣ Feed hex-polygons, arcs, points & rings
  useEffect(() => {
    if (!isInitialized || !globeRef.current) return

    // prepare points
    const pts: any[] = []
    data.forEach((arc) => {
      pts.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      })
      pts.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      })
    })
    const uniquePts = pts.filter(
      (v, i, a) => a.findIndex((x) => x.lat === v.lat && x.lng === v.lng) === i
    )

    globeRef.current
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor(() => defaultProps.polygonColor)
      .arcsData(data)
      .arcStartLat((d: any) => d.startLat)
      .arcStartLng((d: any) => d.startLng)
      .arcEndLat((d: any) => d.endLat)
      .arcEndLng((d: any) => d.endLng)
      .arcColor((d: any) => d.color)
      .arcAltitude((d: any) => d.arcAlt)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((d: any) => d.order)
      .arcDashGap(15)
      .arcDashAnimateTime(defaultProps.arcTime)
      .pointsData(uniquePts)
      .pointColor((d: any) => d.color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(defaultProps.pointSize * 2)
      .ringsData([])
      .ringColor(() => defaultProps.polygonColor)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod(
        (defaultProps.arcTime! * defaultProps.arcLength!) / defaultProps.rings!
      )
  }, [
    isInitialized,
    data,
    defaultProps.pointSize,
    defaultProps.showAtmosphere,
    defaultProps.atmosphereColor,
    defaultProps.atmosphereAltitude,
    defaultProps.polygonColor,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.rings,
    defaultProps.maxRings,
  ])

  // 5️⃣ Animate rings
  useEffect(() => {
    if (!isInitialized || !globeRef.current) return
    const handle = setInterval(() => {
      const count = Math.floor((data.length * 4) / 5)
      const picks = genRandomNumbers(0, data.length, count)
      const ringPts = data
        .filter((_, i) => picks.includes(i))
        .map((d) => ({ lat: d.startLat, lng: d.startLng, color: d.color }))
      globeRef.current.ringsData(ringPts)
    }, 2000)
    return () => clearInterval(handle)
  }, [isInitialized, data])

  return <group ref={groupRef} />
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree()
  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio)
    gl.setSize(size.width, size.height)
    gl.setClearColor(0xffaaff, 0)
  }, [gl, size])
  return null
}

export function World(props: WorldProps) {
  const scene = new Scene()
  scene.fog = new Fog(0xffffff, 400, 2000)

  return (
    // 1️⃣ container must be relative
    <div className="relative h-full w-full">
      <Canvas
        // 2️⃣ Canvas absolutely fills its parent
        className="absolute inset-0 h-full w-full"
        scene={scene}
        camera={new PerspectiveCamera(50, aspect, 180, 1800)}
      >
        <WebGLRendererConfig />
        <ambientLight color={props.globeConfig.ambientLight} intensity={0.6} />
        <directionalLight
          color={props.globeConfig.directionalLeftLight}
          position={new Vector3(-400, 100, 400)}
        />
        <directionalLight
          color={props.globeConfig.directionalTopLight}
          position={new Vector3(-200, 500, 200)}
        />
        <pointLight
          color={props.globeConfig.pointLight}
          position={new Vector3(-200, 500, 200)}
          intensity={0.8}
        />
        <GlobeWrapper {...props} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minDistance={cameraZ}
          maxDistance={cameraZ}
          autoRotate={props.globeConfig.autoRotate ?? true}
          autoRotateSpeed={props.globeConfig.autoRotateSpeed ?? 1}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI - Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}

export function hexToRgb(hex: string) {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b)
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = []
  while (arr.length < count) {
    const n = Math.floor(Math.random() * (max - min)) + min
    if (!arr.includes(n)) arr.push(n)
  }
  return arr
}

export const Globe = World
