import { useSmoothScroll } from './hooks/useSmoothScroll'
import AvatarHero from './components/AvatarHero'

export default function App() {
  useSmoothScroll()

  return (
    <main>
      <AvatarHero />
    </main>
  )
}