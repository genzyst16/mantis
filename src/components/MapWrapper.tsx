"use client";

import dynamic from "next/dynamic";

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">
      Loading Map...
    </div>
  )
});

export function MapWrapper({ checkpoints, scans }: { checkpoints: any[], scans: any[] }) {
  return <DynamicMap checkpoints={checkpoints} scans={scans} />;
}
