"use client";

import { AnimatePresence, motion } from "motion/react";

// `trigger` is a counter: bump it to play the flash again.
export function SealFlash({
  trigger,
  reduced,
  onDone,
}: {
  trigger: number;
  reduced: boolean;
  onDone: () => void;
}) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[80]"
          style={{ background: "radial-gradient(circle, rgba(209,26,31,0.45), rgba(80,0,0,0.75))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: reduced ? [0, 0.25, 0] : [0, 1, 0.2, 0.6, 0] }}
          transition={
            reduced ? { duration: 0.6 } : { duration: 1.4, times: [0, 0.08, 0.3, 0.45, 1] }
          }
          onAnimationComplete={onDone}
        />
      )}
    </AnimatePresence>
  );
}
