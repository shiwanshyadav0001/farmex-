import { useRef, useCallback, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * MagneticButton — Cursor vector math attraction with elastic snap
 * 
 * When cursor approaches the button, the button magnetically shifts
 * toward the cursor with spring physics. On leave, it snaps back
 * with elastic ease. Includes a particle trail emitter on edges.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.35,
  radius = 150,
  showParticles = true,
  style = {},
  ...props
}) {
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < radius) {
        const pull = (1 - dist / radius) * strength;
        x.set(distX * pull);
        y.set(distY * pull);

        // Emit particles at button edge
        if (showParticles && canvasRef.current) {
          emitParticle(
            rect.width / 2 + distX * 0.3,
            rect.height / 2 + distY * 0.3,
            distX,
            distY
          );
        }
      }
    },
    [x, y, strength, radius, showParticles]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovering(false);
  }, [x, y]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  // Particle trail system
  function emitParticle(px, py, vx, vy) {
    const mag = Math.sqrt(vx * vx + vy * vy) || 1;
    particlesRef.current.push({
      x: px,
      y: py,
      vx: (vx / mag) * (1 + Math.random()),
      vy: (vy / mag) * (1 + Math.random()),
      life: 1,
      size: 2 + Math.random() * 3,
    });
    if (particlesRef.current.length > 50) {
      particlesRef.current = particlesRef.current.slice(-50);
    }
  }

  // Animate particles
  useEffect(() => {
    if (!showParticles || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function animate() {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx * 0.5;
        p.y += p.vy * 0.5;
        p.life -= 0.02;
        p.size *= 0.98;

        if (p.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${p.life * 0.6})`;
        ctx.fill();

        return true;
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showParticles]);

  // Resize canvas to match button
  useEffect(() => {
    if (!showParticles || !canvasRef.current || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    canvasRef.current.width = rect.width + 40;
    canvasRef.current.height = rect.height + 40;
  }, [showParticles]);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {showParticles && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
      <motion.div
        ref={buttonRef}
        className={className}
        style={{
          x: springX,
          y: springY,
          position: 'relative',
          zIndex: 5,
          ...style,
        }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}

        {/* Glow ring on hover */}
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: 'inherit',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
