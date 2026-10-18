// Next 16's static export builds prefetch filenames with path.join, so on Windows
// `__next.work.$d$slug.__PAGE__.txt` ends up as nested folders `__next.work/$d$slug/__PAGE__.txt`
// and the client's prefetches 404. This flattens them back. It's a no-op for Linux builds (e.g. Vercel).
import { readdir, rename, rm, stat } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const OUT = new URL('../out/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
let fixed = 0

async function files(dir) {
  const out = []
  for (const name of await readdir(dir)) {
    const p = join(dir, name)
    if ((await stat(p)).isDirectory()) out.push(...(await files(p)))
    else out.push(p)
  }
  return out
}

async function walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name)
    if (!(await stat(p)).isDirectory()) continue
    if (name.startsWith('__next.')) {
      for (const f of await files(p)) {
        const flat = `${name}.${relative(p, f).split(sep).join('.')}`
        await rename(f, join(dir, flat))
        fixed++
      }
      await rm(p, { recursive: true, force: true })
    } else await walk(p)
  }
}

await walk(OUT)
if (fixed) console.log(`fix-export: flattened ${fixed} prefetch segment files`)
