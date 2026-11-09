import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const variants = {
  initial: { opacity: 0, y: 14 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.65, 0, 0.35, 1] } },
};

/** Fades pages in/out and resets scroll position for new pages. */
export default function PageTransition({ children, immersive = false }) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'auto' });
    // Only on mount: in-page hash/query changes manage their own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className={immersive ? 'page-shell page-shell--immersive' : 'page-shell'}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
