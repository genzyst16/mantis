"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export function HistoryDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const applyFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (from) {
      params.set("from", from);
    } else {
      params.delete("from");
    }

    if (to) {
      params.set("to", to);
    } else {
      params.delete("to");
    }

    router.push(`/dashboard/history?${params.toString()}`);
  }, [from, to, router, searchParams]);

  const clearFilter = useCallback(() => {
    setFrom("");
    setTo("");
    router.push(`/dashboard/history`);
  }, [router]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="space-y-1.5 flex-1 w-full">
          <Label htmlFor="from_date" className="text-xs text-slate-500 font-medium">From Date</Label>
          <Input 
            id="from_date" 
            type="date" 
            value={from} 
            onChange={(e) => setFrom(e.target.value)} 
            className="h-9"
          />
        </div>
        <div className="space-y-1.5 flex-1 w-full">
          <Label htmlFor="to_date" className="text-xs text-slate-500 font-medium">To Date</Label>
          <Input 
            id="to_date" 
            type="date" 
            value={to} 
            onChange={(e) => setTo(e.target.value)} 
            className="h-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-none" onClick={clearFilter}>
            Clear
          </Button>
          <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none" onClick={applyFilter}>
            <Filter className="h-4 w-4 mr-1.5" /> Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
