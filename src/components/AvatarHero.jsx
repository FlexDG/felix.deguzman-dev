// Unused — leftover starter scaffold

import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'

function AvatarPlaceholder() {
  return (
    <mesh rotation={[0.4, 0.4, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function AvatarHero() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.5, 4], fov: 35 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={1.2} />
        <AvatarPlaceholder />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} blur={2} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}
