'use client'

import { useEffect, useState } from 'react'
import { profile } from '@/content/profile'

const fmt = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: profile.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

/** Live clock in Surat. Renders a placeholder on the server to avoid hydration mismatch. */
export default function LocalTime({ seconds = true }: { seconds?: boolean }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])

  const shown = time ? (seconds ? time : time.slice(0, 5)) : seconds ? '--:--:--' : '--:--'
  return (
    <time style={{ fontVariantNumeric: 'tabular-nums' }}>
      {shown} {profile.tzLabel}
    </time>
  )
}
