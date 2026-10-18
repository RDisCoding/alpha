import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pure static site: `next build` emits plain HTML/CSS/JS into ./out
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
