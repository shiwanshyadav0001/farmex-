import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltCard — 3D mouse-tracking tilt with glare overlay
 * 
 * Uses CSS perspective + Framer Motion spring physics.
 * Tracks mouse position relative to card center,
 * applies rotateX/rotateY transforms with a reflective
 * glare gradient that follows the cursor.
 */
export default function TiltCard({
  children,
  className = '',
  glareColor = 'rgba(255,255,255,0.15)',
  maxTilt = 15,
  scale = 1.02,
  glare = true,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  });

  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 200,
    damping: 20,
    mass: 0.5,
  });

  // Glare position
  const glareX = useTransform(mouseX, [0, 1], ['-50%', '150%']);
  const glareY = useTransform(mouseY, [0, 1], ['-50%', '150%']);

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => setHovering(true), []);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      className={`tilt-card-wrapper ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="tilt-card-inner"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
        whileHover={{ scale }}
        transition={{ duration: 0.2 }}
      >
        {/* Content at base depth */}
        <div style={{ position: 'relative', zIndex: 1, transform: 'translateZ(20px)' }}>
          {children}
        </div>

        {/* Depth shadow layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: hovering
              ? '0 25px 60px -12px rgba(0,0,0,0.25), 0 10px 30px -8px rgba(0,0,0,0.15)'
              : '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.4s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Glare overlay */}
        {glare && hovering && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 2,
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                width: '200%',
                height: '200%',
                left: glareX,
                top: glareY,
                background: `radial-gradient(circle at center, ${glareColor} 0%, transparent 60%)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
