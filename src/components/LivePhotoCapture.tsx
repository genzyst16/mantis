"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface LivePhotoCaptureProps {
  fieldKey: string;
  onPhotoCaptured: (fieldKey: string, base64: string, hash: string) => void;
  label: string;
}

export function LivePhotoCapture({ fieldKey, onPhotoCaptured, label }: LivePhotoCaptureProps) {
  const [isActive, setIsActive] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Failed to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  // Very basic hash for demonstration. In production, use Web Crypto API (SHA-256)
  const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add watermark
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.fillText(`MANTIS | ${new Date().toLocaleString()}`, 10, canvas.height - 15);
        
        // Compress and extract
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        const hash = generateHash(base64);
        
        setPhotoData(base64);
        onPhotoCaptured(fieldKey, base64, hash);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhotoData(null);
    onPhotoCaptured(fieldKey, "", "");
    startCamera();
  };

  return (
    <div className="space-y-2 border rounded-md p-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div className="font-medium">{label}</div>
      
      {!isActive && !photoData && (
        <Button type="button" variant="outline" className="w-full h-24 border-dashed border-2 flex flex-col items-center justify-center text-slate-500" onClick={startCamera}>
          <Camera className="h-6 w-6 mb-2" />
          <span>Tap to capture live photo</span>
        </Button>
      )}

      {isActive && (
        <div className="relative rounded-md overflow-hidden aspect-video bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button type="button" onClick={capturePhoto} className="rounded-full h-14 w-14 border-4 border-white bg-transparent hover:bg-white/20 p-0 shadow-lg">
               <span className="sr-only">Capture</span>
            </Button>
          </div>
          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-white bg-black/40 hover:bg-black/60 rounded-full" onClick={stopCamera}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {photoData && (
        <div className="relative rounded-md overflow-hidden">
          <img src={photoData} alt="Captured" className="w-full h-auto rounded-md" />
          <Button type="button" variant="secondary" size="sm" className="absolute top-2 right-2 shadow-sm" onClick={retakePhoto}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retake
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
