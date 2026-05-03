import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function Blob() {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.05;
    ref.current.rotation.y += delta * 0.08;
    const { x, y } = state.pointer;
    ref.current.position.x = x * 0.4;
    ref.current.position.y = y * 0.3;
  });
  return (
    <mesh ref={ref} scale={1.6}>
      <icosahedronGeometry args={[1, 32]} />
      <MeshDistortMaterial
        color="#7c6eff"
        distort={0.45}
        speed={1.6}
        roughness={0.25}
        metalness={0.35}
      />
    </mesh>
  );
}

function Wireframe() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta * 0.04;
    ref.current.rotation.y -= delta * 0.06;
  });
  return (
    <mesh ref={ref} scale={2.4}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.18} />
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
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={3} color="#7c6eff" />
      <pointLight position={[-5, -3, -2]} intensity={1.5} color="#22d3ee" />
      <Suspense fallback={null}>
        <Blob />
        <Wireframe />
      </Suspense>
    </Canvas>
  );
}
