import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Research from '@/sections/Research'
import Experience from '@/sections/Experience'
import SideProjects from '@/sections/SideProjects'
import ClientWork from '@/sections/ClientWork'
import Recognition from '@/sections/Recognition'
import Stack from '@/sections/Stack'
import Beyond from '@/sections/Beyond'

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Research />
      <Experience />
      <SideProjects />
      <ClientWork />
      <Recognition />
      <Stack />
      <Beyond />
    </main>
  )
}
