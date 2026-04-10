import { useRef, useEffect, useState, Children, cloneElement, isValidElement } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * RevealOnScroll — Intersection Observer triggered animations
 * 
 * Uses IntersectionObserver to trigger Framer Motion animations
 * when elements enter the viewport. Supports Z-axis depth motion
 * (translateZ), staggered children, and configurable easing.
 */
export default function RevealOnScroll({
  children,
  className = '',
  direction = 'up',       // 'up' | 'down' | 'left' | 'right' | 'zoom' | 'depth'
  delay = 0,
  duration = 0.8,
  stagger = 0.1,
  threshold = 0.15,
  once = true,
  distance = 60,
  style = {},
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          controls.start('visible');
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
          controls.start('hidden');
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls, once, threshold]);

  const getVariants = () => {
    const base = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
          staggerChildren: stagger,
        },
      },
    };

    switch (direction) {
      case 'up':
        base.hidden.y = distance;
        base.visible.y = 0;
        break;
      case 'down':
        base.hidden.y = -distance;
        base.visible.y = 0;
        break;
      case 'left':
        base.hidden.x = distance;
        base.visible.x = 0;
        break;
      case 'right':
        base.hidden.x = -distance;
        base.visible.x = 0;
        break;
      case 'zoom':
        base.hidden.scale = 0.85;
        base.visible.scale = 1;
        break;
      case 'depth':
        // Z-axis translateZ motion for cinematic depth
        base.hidden.z = -100;
        base.hidden.scale = 0.9;
        base.hidden.rotateX = 5;
        base.visible.z = 0;
        base.visible.scale = 1;
        base.visible.rotateX = 0;
        break;
      default:
        base.hidden.y = distance;
        base.visible.y = 0;
    }

    return base;
  };

  const childVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration * 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective: direction === 'depth' ? 1200 : undefined,
        ...style,
      }}
      initial="hidden"
      animate={controls}
      variants={getVariants()}
    >
      {Children.map(children, (child) => {
        if (isValidElement(child) && stagger > 0) {
          return (
            <motion.div variants={childVariant}>
              {child}
            </motion.div>
          );
        }
        return child;
      })}
    </motion.div>
  );
}

/**
 * RevealItem — Individual item for staggered reveal inside RevealOnScroll
 */
export function RevealItem({ children, className = '', style = {} }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
