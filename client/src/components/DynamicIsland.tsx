import { motion, AnimatePresence } from 'framer-motion';
import { Video, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';
import type { TrackingData } from '@/hooks/use-face-tracking';
import { useEffect, useState } from 'react';

interface DynamicIslandProps {
  trackingData: TrackingData;
  duration: number; // in seconds
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function DynamicIsland({ trackingData, duration }: DynamicIslandProps) {
  const { isTracking, eyeContact, yaw, pitch } = trackingData;
  const [lostContactTime, setLostContactTime] = useState(0);

  // Track how long contact has been lost
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking && !eyeContact) {
      interval = setInterval(() => setLostContactTime(p => p + 1), 1000);
    } else {
      setLostContactTime(0);
    }
    return () => clearInterval(interval);
  }, [isTracking, eyeContact]);

  // Determine state
  const isWarning = lostContactTime >= 3; // Warn after 3 seconds of lost contact
  
  let islandState = "idle";
  if (isTracking) {
    islandState = isWarning ? "warning" : "active";
  }

  const islandVariants = {
    idle: { width: 140, height: 44, borderRadius: 22 },
    active: { width: 280, height: 44, borderRadius: 22 },
    warning: { width: 340, height: 80, borderRadius: 24 }
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex justify-center">
      <motion.div
        layout
        variants={islandVariants}
        initial="idle"
        animate={islandState}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`
          glass-panel overflow-hidden flex items-center shadow-2xl relative
          ${isWarning ? 'border-destructive/50 shadow-destructive/20' : 'border-white/[0.08] shadow-black/50'}
        `}
      >
        <AnimatePresence mode="wait">
          {islandState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 w-full justify-center text-muted-foreground font-medium"
            >
              <Video className="w-4 h-4" />
              <span className="text-sm">Ready</span>
            </motion.div>
          )}

          {islandState === "active" && (
            <motion.div 
              key="active"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between px-5 w-full text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </div>
                <span className="text-foreground">Focus Tracking</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground tabular-nums">
                  {formatDuration(duration)}
                </span>
                <div className="h-4 w-px bg-white/10" />
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </motion.div>
          )}

          {islandState === "warning" && (
            <motion.div 
              key="warning"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between px-6 w-full h-full"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span>Align with Camera</span>
                </div>
                <div className="text-xs text-muted-foreground flex gap-3 tabular-nums">
                  <span>Yaw: {yaw.toFixed(0)}°</span>
                  <span>Pitch: {pitch.toFixed(0)}°</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-destructive/10 text-destructive px-3 py-1.5 rounded-full">
                Return Focus
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
