import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Interactive GPU Particles ─── */
function ParticleField({ count = 800, color = '#4ade80', interactive = true }) {
  const pointsRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const { positions, velocities, originalPositions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];
      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;
      sizes[i] = Math.random() * 3 + 1;
    }
    return { positions, velocities, originalPositions, sizes };
  }, [count]);

  // Track mouse in normalized device coords
  const handlePointerMove = useCallback((e) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove);
      return () => window.removeEventListener('pointermove', handlePointerMove);
    }
  }, [interactive, handlePointerMove]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;

    const mx = mouseRef.current.x * viewport.width * 0.5;
    const my = mouseRef.current.y * viewport.height * 0.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Ambient floating motion
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      let tx = ox + Math.sin(t * 0.3 + i * 0.01) * 0.5;
      let ty = oy + Math.cos(t * 0.2 + i * 0.02) * 0.5;
      let tz = oz + Math.sin(t * 0.15 + i * 0.03) * 0.3;

      // Mouse interaction: disperse/cluster
      if (interactive) {
        const dx = pos.array[i3] - mx;
        const dy = pos.array[i3 + 1] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 3;

        if (dist < radius) {
          const force = (1 - dist / radius) * 2;
          tx += (dx / dist) * force;
          ty += (dy / dist) * force;
        }
      }

      // Smooth interpolation
      pos.array[i3] += (tx - pos.array[i3]) * 0.02;
      pos.array[i3 + 1] += (ty - pos.array[i3 + 1]) * 0.02;
      pos.array[i3 + 2] += (tz - pos.array[i3 + 2]) * 0.02;
    }
    pos.needsUpdate = true;
  });

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        map={particleTexture}
        color={color}
        size={0.08}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Glowing Connection Lines ─── */
function ConnectionLines({ count = 30 }) {
  const linesRef = useRef();

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      positions[i6] = (Math.random() - 0.5) * 15;
      positions[i6 + 1] = (Math.random() - 0.5) * 15;
      positions[i6 + 2] = (Math.random() - 0.5) * 5;
      positions[i6 + 3] = positions[i6] + (Math.random() - 0.5) * 4;
      positions[i6 + 4] = positions[i6 + 1] + (Math.random() - 0.5) * 4;
      positions[i6 + 5] = positions[i6 + 2] + (Math.random() - 0.5) * 2;
    }
    return { positions };
  }, [count]);

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count * 2} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#4ade80" transparent opacity={0.15} />
    </lineSegments>
  );
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */
export default function FloatingParticles({
  count = 600,
  color = '#4ade80',
  interactive = true,
  showLines = true,
  style = {},
  className = '',
}) {
  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ParticleField count={count} color={color} interactive={interactive} />
        {showLines && <ConnectionLines count={Math.floor(count / 20)} />}
      </Canvas>
    </div>
  );
}
