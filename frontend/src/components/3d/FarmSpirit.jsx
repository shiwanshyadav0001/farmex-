import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Nature Spirit: Organic Firefly Avatar ─── */
function SpiritCore() {
  const coreRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (coreRef.current) {
      // Gentle pulsing and floating
      coreRef.current.position.y = Math.sin(t * 1.5) * 0.1;
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.03);
    }

    if (auraRef.current) {
      auraRef.current.rotation.z = -t * 0.2;
      auraRef.current.scale.setScalar(1.2 + Math.sin(t * 2) * 0.1);
    }
  });

  return (
    <group>
      {/* Central Heart (Seed-like) */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#388e3c"
          emissive="#2e7d32"
          emissiveIntensity={1.2}
          roughness={0.9}
        />
      </mesh>

      {/* Radiant Aura (Organic Glow) */}
      <mesh ref={auraRef}>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshBasicMaterial
          color="#ffb300"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Inner Soft Light */}
      <pointLight color="#ffb300" intensity={2} distance={4} decay={2} />
      <pointLight color="#81c784" intensity={1} distance={3} position={[0.5, 0.5, 0.5]} />
    </group>
  );
}

/* ─── Spirit Drift: Pollen & Fireflies ─── */
function SpiritTrail({ count = 30 }) {
  const pointsRef = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const c1 = new THREE.Color('#ffb300');
    const c2 = new THREE.Color('#81c784');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const mixed = c1.clone().lerp(c2, Math.random());
      cols[i * 3] = mixed.r;
      cols[i * 3 + 1] = mixed.g;
      cols[i * 3 + 2] = mixed.b;
    }
    return { positions: pos, colors: cols };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Organic drifting motion
      pos.array[i3] += Math.sin(t * 0.5 + i) * 0.005;
      pos.array[i3 + 1] += Math.cos(t * 0.3 + i) * 0.005;
      pos.array[i3 + 2] += Math.sin(t * 0.4 + i) * 0.005;

      // Wrap-around
      if (Math.abs(pos.array[i3]) > 3) pos.array[i3] *= -0.9;
      if (Math.abs(pos.array[i3 + 1]) > 3) pos.array[i3 + 1] *= -0.9;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

export default function FarmSpirit({ className = '', style = {} }) {
  return (
    <div className={className} style={{ width: 200, height: 200, ...style }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} color="#fff1cc" />
        <SpiritCore />
        <SpiritTrail count={30} />
      </Canvas>
    </div>
  );
}
