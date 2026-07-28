"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

// In a full app, this data would be fetched via Server Component or SWR.
// Since recharts needs client components, we wrap the visualization logic here.
// For MVP, we mock the history data shape that would be queried from `inspection_values`
const mockHistoryData = [
  { date: '2026-07-20', fuel: 85, oil_pressure: 45 },
  { date: '2026-07-21', fuel: 80, oil_pressure: 46 },
  { date: '2026-07-22', fuel: 75, oil_pressure: 44 },
  { date: '2026-07-23', fuel: 65, oil_pressure: 45 },
  { date: '2026-07-24', fuel: 55, oil_pressure: 45 },
  { date: '2026-07-25', fuel: 45, oil_pressure: 43 },
  { date: '2026-07-26', fuel: 95, oil_pressure: 46 }, // Refueled
  { date: '2026-07-27', fuel: 90, oil_pressure: 45 },
];

export default function EquipmentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Equipment History</h2>
          <p className="text-slate-500 mt-1">Main Generator No. 1 (GEN-001)</p>
        </div>
        <Badge className="bg-emerald-500 text-sm px-3 py-1">Operational</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Level Trend</CardTitle>
            <CardDescription>Percentage over last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} />
                  <YAxis tick={{fontSize: 12}} domain={[0, 100]} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip />
                  <Area type="monotone" dataKey="fuel" stroke="#10b981" fillOpacity={1} fill="url(#colorFuel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oil Pressure Trend</CardTitle>
            <CardDescription>PSI over last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} />
                  <YAxis tick={{fontSize: 12}} domain={[0, 60]} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip />
                  <Area type="monotone" dataKey="oil_pressure" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOil)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
