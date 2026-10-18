'use client'

import { useEffect } from 'react'
import { sound } from '@/lib/sound/engine'

/** Loads the visitor's saved sound preferences once on the client. */
export default function SoundBridge() {
  useEffect(() => sound.init(), [])
  return null
}
