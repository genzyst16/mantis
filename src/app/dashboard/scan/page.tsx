"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, MapPin, Loader2 } from "lucide-react";
import { validateScanAndLocation, checkCheckpointRequirements } from "./actions";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);
  const [status, setStatus] = useState<string>("Initializing camera...");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let activeControls: IScannerControls | null = null;
    
    const startScanner = async () => {
      try {
        const codeReader = new BrowserQRCodeReader();
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
        
        // Prefer back camera
        const backCamera = videoInputDevices.find((device) => device.label.toLowerCase().includes('back')) || videoInputDevices[0];
        
        if (!backCamera) {
          throw new Error("No camera devices found.");
        }
        
        if (videoRef.current) {
          activeControls = await codeReader.decodeFromVideoDevice(
            backCamera.deviceId, 
            videoRef.current, 
            (result, error, controls) => {
              if (result && !isProcessing) {
                // Stop scanning when a result is found
                controls.stop();
                handleSuccessfulScan(result.getText());
              }
            }
          );
          setControls(activeControls);
          setStatus("Point the camera at the checkpoint QR code");
        }
      } catch (err: any) {
        setError(err.message || "Failed to access camera. Please check permissions.");
        setStatus("Camera error");
      }
    };

    startScanner();

    return () => {
      if (activeControls) {
        activeControls.stop();
      }
    };
  }, [isProcessing]);

  const handleSuccessfulScan = async (qrToken: string) => {
    setIsProcessing(true);
    setStatus("QR code detected. Checking requirements...");
    setError(null);

    const reqResult = await checkCheckpointRequirements(qrToken);
    if (reqResult.error) {
      setError(reqResult.error);
      setIsProcessing(false);
      return;
    }

    if (reqResult.requiresGeofence) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setIsProcessing(false);
        return;
      }

      setStatus("Acquiring GPS location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setStatus("Validating with server...");
          await processValidation(qrToken, latitude, longitude, accuracy);
        },
        (geoError) => {
          let msg = "Failed to get location.";
          if (geoError.code === 1) msg = "Location permission denied. Please enable GPS.";
          else if (geoError.code === 2) msg = "Location unavailable. Ensure GPS is on.";
          else if (geoError.code === 3) msg = "Location request timed out.";
          
          setError(msg);
          setIsProcessing(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatus("Validating with server...");
      await processValidation(qrToken, null, null, null);
    }
  };

  const processValidation = async (qrToken: string, lat: number | null, lon: number | null, acc: number | null) => {
    const result = await validateScanAndLocation(qrToken, lat, lon, acc);
    
    if (result.error) {
      setError(result.error);
      setIsProcessing(false);
    } else if (result.success) {
      setStatus(`Verified: ${result.checkpointName}. Opening form...`);
      router.push(`/dashboard/inspection/${result.sessionId}`);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-600" /> 
            Scan Checkpoint
          </CardTitle>
          <CardDescription>
            Hold your device steady and point the camera at the QR code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] md:aspect-video flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center text-white space-y-4 p-4 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className="font-medium">{status}</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" />
                
                {/* Scanner Overlay Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 aspect-square max-w-sm border-2 border-emerald-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div className="w-full h-full relative">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg -mt-1 -ml-1"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg -mt-1 -mr-1"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg -mb-1 -ml-1"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg -mb-1 -mr-1"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isProcessing && !error && (
            <div className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
              {status}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Verification Failed</p>
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setError(null);
                    setIsProcessing(false);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
