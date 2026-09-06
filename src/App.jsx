// Root app — section order

import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useHoverFill } from './hooks/useHoverFill'
import IntroCurtain from './components/IntroCurtain'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import HeroStage from './components/HeroStage'
import About from './components/About'
import AboutMe from './components/AboutMe'
import Projects from './components/Projects'
import Process from './components/Process'
import Services from './components/Services'
import Why from './components/Why'
import GamingPCSection from './components/GamingPC/GamingPCSection'
import Faq from './components/Faq'
import Contact from './components/Contact'
import SiteFooter from './components/SiteFooter'

export default function App() {
  useSmoothScroll()
  useHoverFill()

  return (
    <>
      <IntroCurtain />
      <Navbar />
      <main>
        <HeroStage />
        <About />
        <AboutMe />
        <Projects />
        <Process />
        <Services />
        <Why />
        <GamingPCSection />
        <Faq />
        <div data-ftr="reveal" className="relative z-[8]">
          <Contact />
          <SiteFooter />
        </div>
      </main>

      <Cursor />
    </>
  )
}
