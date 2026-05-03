import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function Blob() {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
    const { x, y } = state.pointer;
    ref.current.position.x = x * 0.6;
    ref.current.position.y = y * 0.4;
  });
  return (
    <mesh ref={ref} scale={1.9}>
      <icosahedronGeometry args={[1, 48]} />
      <MeshDistortMaterial
        color="#7c6eff"
        distort={0.55}
        speed={2.2}
        roughness={0.15}
        metalness={0.6}
        emissive="#5a4cff"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function Wireframe() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta * 0.07;
    ref.current.rotation.y -= delta * 0.1;
  });
  return (
    <mesh ref={ref} scale={2.7}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.45} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={4} color="#7c6eff" />
      <pointLight position={[-5, -3, -2]} intensity={2.5} color="#22d3ee" />
      <pointLight position={[0, 4, 4]} intensity={1.5} color="#ffffff" />
      <Suspense fallback={null}>
        <Blob />
        <Wireframe />
      </Suspense>
    </Canvas>
  );
}
