# Rudray Dave — Portfolio v2

A fully static portfolio (no backend) built with Next.js 16 (`output: 'export'`), GSAP + ScrollTrigger + SplitText, Lenis smooth scroll and a hand-written WebGL shader.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site → ./out (plain HTML/CSS/JS, host anywhere)
npm run preview    # serve ./out locally
```

## Editing content

Everything you'd want to change lives in **`src/content/`**. No component edits needed.

| File | What's in it |
| --- | --- |
| `profile.ts` | Name, email, socials, résumé link, About manifesto, bio, facts |
| `experience.ts` | Internships / roles (Experience accordion) |
| `projects.ts` | Every project, grouped as `research`, `side` or `client`; each gets a `/work/<slug>` case study |
| `research.ts` | Research intro, interests, mentors and the publications list |
| `recognition.ts` | Hackathons, competitions, achievements |
| `background.ts` | Skills, coursework, education, leadership, hobbies |

### Add a project

1. Copy an object in `projects.ts` and give it a unique `slug`; its page appears at `/work/<slug>/`.
2. Set `group`:
   - `research` puts it in the pinned horizontal Research gallery (the main section). Add `status` (`'Ongoing'`, `'Accepted · Springer'`…) and `advisor` if relevant.
   - `side` puts it in the filterable Side projects index (hackathons, coursework, personal builds). `filters` controls which filter chips it shows under.
   - `client` puts it in Client work (freelance sites).
   Order within the array is the order on the site, and figure numbers (R01, S03, C02) follow it.
3. Screenshots: `npm run images -- "<folder of pngs>" work/<slug>` converts them to WebP in `public/images/work/<slug>/`. Use one as `cover` and list them in `gallery`.
4. No screenshots? Leave out `cover` and pick an `art` style: `nodes`, `ridges`, `spectro`, `matrix`, `orbits`, `bars` or `court`. A unique "FIG." artwork is generated from the slug.

### Soundtrack

The music is generated in the browser with the Web Audio API (`src/lib/sound/`): no audio files, no licensing. Three tracks ship by default: Lo-fi Tensors, Latent Drift and Night Shift.

Each track is composed once into a seamless loop in an `OfflineAudioContext` (off the main thread, while the preloader runs), then played as a single looping buffer at 32 kHz. Nothing on the page — scrolling, WebGL, image loading — can glitch it. It muffles while the menu is open and pauses when the tab is hidden.

- First-time visitors choose **Enter with sound / in silence** at the end of the preloader (browsers block audio until a click). The choice is remembered.
- Controls: the sound toggle and next-track button in the nav, plus the track list and volume in the menu.
- To add your own song, drop an MP3 into `public/music/` and add `{ kind: 'file', title, note, src: '/music/your-song.mp3' }` to `src/content/music.ts`. Only use music you have the rights to publish.

### Add a hackathon / achievement

Add an object to `recognition.ts`. `mark` is the big text on the card (`1st`, `#11`, `Finalist`…). Set `slug` to link it to a project page.

## Structure

```
src/
  app/            layout (nav, footer, preloader, cursor), home page, /work/[slug], sitemap, robots
  content/        ← all the data
  sections/       Hero, About, Research, Experience, SideProjects, ClientWork, Recognition, Stack, Beyond, ProjectView
  components/     ShaderCanvas (WebGL), GenerativeCover, Spectrogram, Preloader, Cursor, Nav, Footer,
                  Reveal (SplitText), Marquee, Magnetic, TiltCard, Counter, TransitionLink, PageTransition
  lib/            gsap setup; Lenis / preloader / page-transition runtime
scripts/
  optimize-images.mjs   screenshots → WebP
  fix-export.mjs        postbuild: fixes a Next 16 Windows-only export bug (prefetch file names); no-op on Linux
```

## Deploying

- **Vercel:** import the repo and set the root directory to this folder. The build runs `next build` and serves `out/`. `public/og.jpg` is the social share image, and Vercel Analytics turns on automatically.
- **Anywhere else** (Netlify, GitHub Pages, Cloudflare Pages, S3): upload the `out/` folder.

## Accessibility & performance notes

- `prefers-reduced-motion` disables the preloader, smooth scroll, scrubbed animations and the shader loop.
- The custom cursor only appears on fine-pointer (mouse) devices.
- The shader renders at half resolution and pauses offscreen; the spectrogram and marquees also pause offscreen.
