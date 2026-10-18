// Converts screenshots to web-sized WebP under public/images/<out>.
//   npm run images -- <input file|folder> <output folder, relative to public/images> [maxWidth=1800]
//   npm run images -- "C:/Users/me/Desktop/shots" work/my-new-project
import sharp from 'sharp'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const [input, outRel, max = '1800'] = process.argv.slice(2)
if (!input || !outRel) {
  console.log('Usage: npm run images -- <input file|folder> <output folder under public/images> [maxWidth]')
  process.exit(1)
}

const outDir = join(process.cwd(), 'public', 'images', outRel)
await mkdir(outDir, { recursive: true })

const files = (await stat(input)).isDirectory() ? (await readdir(input)).map((f) => join(input, f)) : [input]

for (const file of files.filter((f) => /\.(png|jpe?g|webp|avif|tiff?)$/i.test(f))) {
  const name = basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const info = await sharp(file)
    .resize({ width: Number(max), withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(outDir, `${name}.webp`))
  console.log(`→ /images/${outRel}/${name}.webp  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}
