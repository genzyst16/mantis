"use client";

import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Download } from "lucide-react";
import { useRef } from 'react';

export function QRCodeModal({ token, checkpointName }: { token: string, checkpointName: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40; // Add padding
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-${checkpointName}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 h-9 px-3">
        <QrCode className="mr-2 h-4 w-4" /> QR Code
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>{checkpointName} QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-6 bg-slate-50 rounded-md">
          <QRCodeSVG 
            value={token} 
            size={256} 
            level="H"
            includeMargin={true}
            ref={svgRef}
          />
        </div>
        <div className="text-sm text-slate-500 break-all mb-4">
          Token: {token}
        </div>
        <Button onClick={downloadQR} className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Download className="mr-2 h-4 w-4" /> Download PNG
        </Button>
      </DialogContent>
    </Dialog>
  );
}
