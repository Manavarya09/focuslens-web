import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface TrackingData {
  isTracking: boolean;
  eyeContact: boolean;
  yaw: number;
  pitch: number;
  roll: number;
  error?: string;
  hasHardware: boolean;
}

export function useFaceTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>();
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  
  const [data, setData] = useState<TrackingData>({
    isTracking: false,
    eyeContact: true,
    yaw: 0,
    pitch: 0,
    roll: 0,
    hasHardware: false
  });

  const initMediaPipe = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      
      landmarkerRef.current = faceLandmarker;
    } catch (err) {
      console.error("Error initializing MediaPipe:", err);
      setData(p => ({ ...p, error: "Failed to load vision models." }));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setData(p => ({ ...p, hasHardware: true, isTracking: true }));
        };
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setData(p => ({ ...p, error: "Camera access denied. Please grant permissions." }));
    }
  };

  const processFrame = useCallback(() => {
    if (videoRef.current && landmarkerRef.current && videoRef.current.currentTime > 0) {
      const startTimeMs = performance.now();
      const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
        // Extract 4x4 matrix for head pose estimation
        const matrix = results.facialTransformationMatrixes[0].data;
        
        // Very basic Euler angle approximation from transformation matrix
        // Assuming array is column-major 4x4 as per standard WebGL/MediaPipe format
        const r11 = matrix[0], r21 = matrix[1], r31 = matrix[2];
        const r32 = matrix[6], r33 = matrix[10];

        // Calculate Yaw, Pitch, Roll in degrees
        const pitch = Math.atan2(-r32, r33) * (180 / Math.PI);
        const yaw = Math.asin(r31) * (180 / Math.PI);
        const roll = Math.atan2(-r21, r11) * (180 / Math.PI);

        // Determine Eye Contact threshold (~15 degrees tolerance)
        const eyeContact = Math.abs(yaw) < 15 && Math.abs(pitch) < 18;

        setData(prev => ({
          ...prev,
          yaw: Number(yaw.toFixed(2)),
          pitch: Number(pitch.toFixed(2)),
          roll: Number(roll.toFixed(2)),
          eyeContact
        }));
      } else {
        // No face detected - assume lost eye contact
        setData(prev => ({ ...prev, eyeContact: false }));
      }
    }
    
    // Loop
    requestRef.current = requestAnimationFrame(processFrame);
  }, []);

  const startTracking = async () => {
    setData(p => ({ ...p, error: undefined }));
    if (!landmarkerRef.current) {
      await initMediaPipe();
    }
    await startCamera();
    requestRef.current = requestAnimationFrame(processFrame);
  };

  const stopTracking = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setData(p => ({ ...p, isTracking: false }));
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return { videoRef, data, startTracking, stopTracking };
}
