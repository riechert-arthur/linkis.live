import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeProgress(timer: number, max: number) {
  const remaining = Math.max(0, max - Math.max(0, timer));
  return Math.min(100, 100 - (remaining / max) * 100); 
}
