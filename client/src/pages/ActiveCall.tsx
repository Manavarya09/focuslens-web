import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useFaceTracking } from "@/hooks/use-face-tracking";
import { useCreateSession, useUpdateSession, useCreateTelemetry } from "@/hooks/use-sessions";
import { DynamicIsland } from "@/components/DynamicIsland";
import { PhoneOff, Maximize, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ActiveCall() {
  const [, setLocation] = useLocation();
  const { videoRef, data: trackingData, startTracking, stopTracking } = useFaceTracking();
  
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const createTelemetry = useCreateTelemetry();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  
  // Track metrics for final average
  const metricsRef = useRef({ totalEvents: 0, eyeContactEvents: 0 });

  // 1. Initialize Camera and Session
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Create session on backend
      const newSession = await createSession.mutateAsync({
        title: `Meeting ${new Date().toLocaleTimeString()}`,
      });
      
      if (mounted) {
        setSessionId(newSession.id);
        await startTracking();
      }
    }
    
    init();

    return () => {
      mounted = false;
      stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Timer and Telemetry Loop
  useEffect(() => {
    if (!sessionId || !trackingData.isTracking) return;

    // Duration timer
    const timer = setInterval(() => setDuration(d => d + 1), 1000);

    // Telemetry recorder (every 1 second)
    const telemetryInterval = setInterval(() => {
      // Update local metrics array for quick average computation at the end
      metricsRef.current.totalEvents += 1;
      if (trackingData.eyeContact) {
        metricsRef.current.eyeContactEvents += 1;
      }

      // Send to backend
      createTelemetry.mutate({
        sessionId,
        eyeContact: trackingData.eyeContact,
        yaw: trackingData.yaw,
        pitch: trackingData.pitch,
        roll: trackingData.roll
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(telemetryInterval);
    };
  }, [sessionId, trackingData, createTelemetry]);

  // 3. End Call Handler
  const handleEndCall = async () => {
    if (sessionId) {
      const { totalEvents, eyeContactEvents } = metricsRef.current;
      const averageEyeContact = totalEvents > 0 
        ? (eyeContactEvents / totalEvents) * 100 
        : 0;

      await updateSession.mutateAsync({
        id: sessionId,
        endTime: new Date(),
        duration,
        averageEyeContact,
      });
    }
    
    stopTracking();
    setLocation("/");
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-sans">
      <DynamicIsland trackingData={trackingData} duration={duration} />

      {/* Main Video Feed */}
      <div className="absolute inset-0 flex items-center justify-center">
        {trackingData.error ? (
          <div className="text-center text-white">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <PhoneOff className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Camera Error</h2>
            <p className="text-white/60">{trackingData.error}</p>
            <button 
              onClick={() => setLocation("/")}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              Return Home
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-[90vw] h-[85vh] rounded-[2rem] overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10"
          >
            {!trackingData.hasHardware && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-white/60 font-medium">Initializing Neural Engine...</p>
                </div>
              </div>
            )}
            <video 
              ref={videoRef}
              className="w-full h-full object-cover transform -scale-x-100" // Mirror for standard webcam feel
              playsInline
              muted
            />
            
            {/* Visual Guidelines (Rule of Thirds / Camera Alignment) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 border-[1px] border-white/20">
              <div className="w-full h-1/3 border-b border-white/30" />
              <div className="w-full h-1/3 border-b border-white/30" />
              <div className="absolute top-0 h-full w-1/3 border-r border-white/30 left-1/3" />
              <div className="absolute top-0 h-full w-1/3 border-r border-white/30 left-2/3" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Controls Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 glass-panel rounded-full p-2 pl-6 shadow-2xl">
        <div className="text-sm font-medium text-white/80 pr-4 border-r border-white/10">
          FocusLens Active
        </div>
        <button className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white/80 hover:text-white">
          <Maximize className="w-5 h-5" />
        </button>
        <button 
          onClick={handleEndCall}
          className="w-12 h-12 rounded-full bg-destructive hover:bg-destructive/80 text-white flex items-center justify-center transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
