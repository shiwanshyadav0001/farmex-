import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function RainField({ count = 360, storm = false }) {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 28;
      data[i * 3 + 1] = Math.random() * 18 - 4;
      data[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return data;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const speed = storm ? 15 : 10;
    const array = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i += 1) {
      const xIndex = i * 3;
      const yIndex = i * 3 + 1;
      array[yIndex] -= delta * speed;
      array[xIndex] -= delta * (storm ? 2.5 : 1.25);

      if (array[yIndex] < -7) {
        array[yIndex] = 12 + Math.random() * 3;
        array[xIndex] = (Math.random() - 0.5) * 28;
      }

      if (array[xIndex] < -16) {
        array[xIndex] = 16;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} rotation={[0.18, 0.12, 0.24]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={storm ? '#c7d2fe' : '#bae6fd'}
        size={storm ? 0.11 : 0.08}
        transparent
        opacity={storm ? 0.95 : 0.78}
        depthWrite={false}
      />
    </points>
  );
}

function CloudBand({ depth = 0, speed = 0.08, color = '#dbeafe', opacity = 0.12 }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = Math.sin(state.clock.elapsedTime * speed + depth) * 2.5;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 0.6 + depth) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 3.5 - depth, -4 - depth]}>
      {[-4, -1.5, 1.2, 4.2].map((x, index) => (
        <mesh key={`${depth}-${x}`} position={[x, Math.sin(index + depth) * 0.3, 0]} scale={[2.8, 1 + index * 0.15, 1]}>
          <sphereGeometry args={[1.15, 24, 24]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function FogLayer({ color = '#d9f99d', opacity = 0.09, y = -1.4, speed = 0.15 }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.x = Math.sin(state.clock.elapsedTime * speed + y) * 1.8;
    meshRef.current.material.opacity = opacity + Math.sin(state.clock.elapsedTime * 0.45 + y) * 0.025;
  });

  return (
    <mesh ref={meshRef} position={[0, y, -1.5]} rotation={[-Math.PI / 2.8, 0, 0]}>
      <planeGeometry args={[26, 8, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function SunAura() {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.08;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={ref} position={[5.4, 4.4, -6]}>
      <sphereGeometry args={[1.4, 32, 32]} />
      <meshBasicMaterial color="#fde68a" transparent opacity={0.95} />
    </mesh>
  );
}

function FloatingDust({ count = 120, color = '#fef3c7' }) {
  const ref = useRef(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 24;
      data[i * 3 + 1] = Math.random() * 12 - 3;
      data[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return data;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.07} transparent opacity={0.65} depthWrite={false} />
    </points>
  );
}

function SceneContent({ mode }) {
  const storm = mode === 'storm';
  const rainy = mode === 'rain' || storm;
  const misty = mode === 'mist';
  const cloudy = mode === 'cloudy' || rainy || misty;
  const clear = mode === 'clear';

  return (
    <>
      <color attach="background" args={[storm ? '#08111f' : rainy ? '#091a2c' : cloudy ? '#10233a' : '#0f3b2d']} />
      <fog attach="fog" args={[storm ? '#08111f' : '#10233a', 9, 28]} />
      <ambientLight intensity={storm ? 0.42 : 0.72} color={storm ? '#94a3b8' : '#d9f99d'} />
      <directionalLight position={[4, 7, 3]} intensity={storm ? 1.4 : 1} color={storm ? '#bfdbfe' : '#fef9c3'} />
      <pointLight position={[-4, 2, 2]} intensity={storm ? 1.6 : 0.8} color={storm ? '#60a5fa' : '#86efac'} />

      <mesh position={[0, -3.2, -2]} rotation={[-Math.PI / 2.1, 0, 0]}>
        <planeGeometry args={[34, 20, 1, 1]} />
        <meshStandardMaterial
          color={storm ? '#0f172a' : rainy ? '#0b2239' : '#123524'}
          emissive={storm ? '#1d4ed8' : rainy ? '#0ea5e9' : '#14532d'}
          emissiveIntensity={storm ? 0.18 : 0.12}
          roughness={0.9}
          metalness={0.08}
        />
      </mesh>

      {cloudy && (
        <>
          <CloudBand depth={0} speed={0.05} color={storm ? '#94a3b8' : '#dbeafe'} opacity={storm ? 0.2 : 0.13} />
          <CloudBand depth={1.4} speed={0.09} color={storm ? '#64748b' : '#bfdbfe'} opacity={storm ? 0.22 : 0.1} />
        </>
      )}
      {rainy && <RainField count={storm ? 460 : 320} storm={storm} />}
      {misty && (
        <>
          <FogLayer color="#d9f99d" opacity={0.08} y={-0.5} speed={0.18} />
          <FogLayer color="#e0f2fe" opacity={0.11} y={-1.6} speed={0.12} />
        </>
      )}
      {clear && (
        <>
          <SunAura />
          <FloatingDust count={130} color="#fef08a" />
        </>
      )}
      {!clear && !misty && !rainy && <FloatingDust count={90} color="#dbeafe" />}
    </>
  );
}

export function getWeatherSceneMode(description = '') {
  const text = description.toLowerCase();
  if (text.includes('thunder') || text.includes('storm')) return 'storm';
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return 'rain';
  if (text.includes('mist') || text.includes('fog') || text.includes('haze') || text.includes('smoke')) return 'mist';
  if (text.includes('cloud') || text.includes('overcast')) return 'cloudy';
  return 'clear';
}

export default function WeatherSceneFX({ description = '', className = '' }) {
  const mode = getWeatherSceneMode(description);
  const [flashOpacity, setFlashOpacity] = useState(0);

  useEffect(() => {
    if (mode !== 'storm') return undefined;

    const interval = window.setInterval(() => {
      setFlashOpacity(0.85);
      window.setTimeout(() => setFlashOpacity(0.2), 120);
      window.setTimeout(() => setFlashOpacity(0), 250);
    }, 3800);

    return () => window.clearInterval(interval);
  }, [mode]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 0.5, 10], fov: 48 }} dpr={[1, 1.5]}>
        <SceneContent mode={mode} />
      </Canvas>
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: flashOpacity,
          background: 'linear-gradient(180deg, rgba(191,219,254,0.9) 0%, rgba(255,255,255,0.25) 28%, rgba(255,255,255,0) 65%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            mode === 'storm'
              ? 'radial-gradient(circle at 20% 10%, rgba(96,165,250,0.18), transparent 30%), linear-gradient(180deg, rgba(2,6,23,0.24), rgba(2,6,23,0.72))'
              : mode === 'rain'
                ? 'linear-gradient(180deg, rgba(3,7,18,0.1), rgba(3,7,18,0.55))'
                : mode === 'mist'
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(15,23,42,0.48))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(3,7,18,0.38))',
        }}
      />
    </div>
  );
}
