import { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * FarmScene - Immersive Claymorphic 3D Background
 * Optimized for stability to prevent WebGL Context Loss.
 */

export default function FarmScene({ farmCount = 0 }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1, 8], fov: 40 }}
      dpr={[1, 2]}
      frameloop="always" // Explicitly force the render loop
      style={{ position: 'absolute', inset: 0, background: '#f0fdf4' }}
      gl={{ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance'
      }}
    >
      <Suspense fallback={null}>
        {/* Soft Natural Lighting */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#c8e6c9" />
        <spotLight
          position={[10, 15, 10]}
          angle={0.25}
          penumbra={1}
          intensity={2.5}
          castShadow
          shadow-mapSize={[512, 512]} // Lower for better performance during init
        />
        <pointLight position={[-5, 5, 2]} intensity={1} color="#a5d6a7" />

        <group position={[0, 0, 0]} rotation={[0.05, -0.3, 0]}>
          <ClaySoil />
          <ClayFarmer />
          <ClayHUD />
          
          {/* Dynamic Green Trees */}
          <ClayTree position={[-1.5, -1.8, -0.5]} scale={2.5} />
          <ClayTree position={[1, -1.8, 0.4]} scale={1.8} />
          <ClayTree position={[3, -1.8, -0.3]} scale={3} />
          <ClayTree position={[4.5, -1.8, 0.2]} scale={2.2} />
          
          {farmCount > 5 && <ClayTree position={[-4.5, -1.8, -0.8]} scale={1.8} />}
          {farmCount > 10 && <ClayTree position={[6.5, -1.8, -0.6]} scale={2.4} />}
        </group>

        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.4}
          scale={20}
          blur={2.5}
          far={5}
        />
      </Suspense>
    </Canvas>
  );
}

/* ─── Clay Soil Platform ─── */
function ClaySoil() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Base Soil */}
      <mesh receiveShadow>
        <boxGeometry args={[14, 1.4, 4.5]} />
        <meshStandardMaterial color="#4e342e" roughness={1} />
      </mesh>
      {/* Grass Top */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[13.8, 0.15, 4.3]} />
        <meshStandardMaterial color="#66bb6a" roughness={1} />
      </mesh>
    </group>
  );
}

/* ─── Stylized Clay Tree ─── */
function ClayTree({ position = [0, 0, 0], scale = 1 }) {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime(); // Use method call for robustness
    if (group.current) {
      const sway = Math.sin(t * 1.5 + position[0]) * 0.05;
      group.current.scale.setScalar(scale + sway * scale);
      
      // Add a slight rotation sway
      group.current.rotation.z = Math.sin(t * 0.5 + position[0]) * 0.02;
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#388e3c" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.4, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#43a047" roughness={0.9} />
      </mesh>
      <mesh position={[-0.25, 0.5, -0.1]} castShadow>
        <sphereGeometry args={[0.4, 10, 10]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Refined Clay Farmer ─── */
function ClayFarmer() {
  const groupRef = useRef();
  const phoneRef = useRef();
  const headRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle breathing/sway
      groupRef.current.position.y = -1.8 + Math.sin(t * 1.2) * 0.04;
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.02;
    }
    if (headRef.current) {
      // Nodding/Searching motion
      headRef.current.rotation.y = Math.sin(t * 1.5) * 0.15;
      headRef.current.rotation.x = 0.3 + Math.sin(t * 0.8) * 0.1; 
    }
    if (phoneRef.current?.material) {
      // Screen pulse
      phoneRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 4) * 1.2;
    }
  });

  return (
    <group ref={groupRef} position={[-4, -1.8, 1]} rotation={[0, Math.PI * 0.15, 0]} scale={1.3}>
      {/* Legs */}
      <mesh position={[-0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.16, 0.7, 4, 8]} />
        <meshStandardMaterial color="#283593" roughness={1} />
      </mesh>
      <mesh position={[0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.16, 0.7, 4, 8]} />
        <meshStandardMaterial color="#283593" roughness={1} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.3, 0.7, 4, 8]} />
        <meshStandardMaterial color="#e65100" roughness={1} />
      </mesh>
      
      {/* Arms & Phone */}
      <group position={[0, 0.8, 0]}>
        <mesh position={[0.4, -0.2, 0.4]} rotation={[Math.PI * 0.3, -Math.PI * 0.1, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color="#e65100" roughness={1} />
        </mesh>
        <mesh position={[0.65, 0, 0.5]} rotation={[0, -Math.PI * 0.2, 0.4]}>
          <boxGeometry args={[0.08, 0.28, 0.16]} />
          <meshStandardMaterial color="#212121" roughness={0.3} />
          {/* Screen */}
          <mesh position={[0.045, 0, 0]}>
            <planeGeometry args={[0.22, 0.1]} />
            <meshStandardMaterial
              ref={phoneRef}
              color="#90caf9"
              emissive="#2196f3"
              emissiveIntensity={2}
            />
          </mesh>
        </mesh>
      </group>

      <group ref={headRef} position={[0, 1.25, 0]}>
        <mesh>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color="#ffccbc" roughness={1} />
        </mesh>
        {/* Hat */}
        <group position={[0, 0.1, 0]}>
          <mesh rotation={[Math.PI * 0.1, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
            <meshStandardMaterial color="#d7ccc8" roughness={1} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.24, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#d7ccc8" roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ─── Floating Data HUD ─── */
function ClayHUD() {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[2.5, 0.8, -0.5]} rotation={[0, -Math.PI * 0.15, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 2.2, 0.1]} />
          <meshStandardMaterial color="#7986cb" transparent opacity={0.6} roughness={0.3} />
        </mesh>
        <group position={[-1, 0.4, 0.1]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.06]} />
            <meshStandardMaterial color="#81c784" />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[1.3, 0.12, 0.06]} />
            <meshStandardMaterial color="#ffb74d" />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <boxGeometry args={[1.5, 0.12, 0.06]} />
            <meshStandardMaterial color="#64b5f6" />
          </mesh>
        </group>
        <mesh position={[1.1, 0.5, 0.1]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
        <mesh position={[1.1, -0.2, 0.1]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial color="#ff9800" />
        </mesh>
      </group>
    </Float>
  );
}
