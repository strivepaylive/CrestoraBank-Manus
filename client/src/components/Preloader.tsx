import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  isLoading: boolean;
}

export function Preloader({ isLoading }: PreloaderProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay before hiding to ensure the animation is seen
      // and to make the transition feel deliberate
      const timer = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <div className="relative flex items-center justify-center w-32 h-32 mb-4">
            {/* Orbit 1 */}
            <motion.div
              className="absolute inset-2 rounded-full border-[3px] border-primary/30"
              style={{ borderTopColor: "transparent", borderBottomColor: "transparent" }}
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            </motion.div>
            
            {/* Orbit 2 */}
            <motion.div
              className="absolute inset-6 rounded-full border-[3px] border-primary/50"
              style={{ borderLeftColor: "transparent", borderRightColor: "transparent" }}
              animate={{ rotate: -360, scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
            </motion.div>
            
            {/* Center Core */}
            <motion.div
              className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg font-semibold tracking-wide text-foreground/80"
          >
            Crestora Bank
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Securing your connection...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
