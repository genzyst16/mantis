import { Card, CardContent } from "@/components/ui/card";
import { Info, Code, Calendar, MonitorPlay, Layers, Cpu, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-4 sm:mt-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Info className="h-8 w-8 text-blue-600" />
              System Documentation
            </h1>
            <p className="text-slate-500 mt-2">Technical and version details about Mantis.</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="hidden sm:flex">Back</Button>
          </Link>
        </div>

        {/* Content */}
        <Card className="border-slate-200 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="bg-slate-900 p-8 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 rounded-full mb-4">
                <MonitorPlay className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Mantis Inspection System</h2>
              <p className="text-slate-400 text-sm">Automated Checkpoint & Task Management</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    <Layers className="h-4 w-4" /> Version
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">1.0.0 (Production)</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    <Calendar className="h-4 w-4" /> Date of Development
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">July 2026</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    <Code className="h-4 w-4" /> Developer
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">GenZyst</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    <Cpu className="h-4 w-4" /> Developed For
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">Property Management and Engineering Group</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    <Building2 className="h-4 w-4" /> Owner
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">H Hospitality Group Corporation - IT Group</p>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-3">
                  How it's Developed (Technology Stack)
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full">Next.js 14</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full">React</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full">Supabase (PostgreSQL)</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full">Tailwind CSS</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full">Progressive Web App (PWA)</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                  Mantis is built on a modern server-rendered architecture utilizing Next.js App Router for optimal performance. It leverages Supabase for real-time database capabilities, secure authentication, and Row Level Security (RLS) to enforce strict role-based access controls across properties and personnel.
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="block sm:hidden mt-8">
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full h-12">Back to Dashboard</Button>
            </Link>
        </div>

      </div>
    </div>
  );
}
