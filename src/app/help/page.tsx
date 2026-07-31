import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MapPin, ClipboardCheck, Wrench, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-4 sm:mt-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              Help & Guides
            </h1>
            <p className="text-slate-500 mt-2">Learn how to navigate and use the Mantis Inspection System effectively.</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="hidden sm:flex">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-4">
          
          <details className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm open:shadow-md transition-all">
            <summary className="flex items-center gap-3 p-5 font-bold text-lg cursor-pointer text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 list-none [&::-webkit-details-marker]:hidden">
              <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              How to Perform an Inspection
              <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
              <ol className="list-decimal pl-5 space-y-2 mt-3 text-sm sm:text-base">
                <li>Go to your <strong>Dashboard</strong> on your mobile device.</li>
                <li>Tap on the large <strong>Scan QR Code</strong> button at the top.</li>
                <li>Point your camera at the QR code located at the checkpoint.</li>
                <li>Once scanned, you will be taken to the Inspection Form.</li>
                <li>Fill out all mandatory checks. If you encounter any defects, tap <strong>"Log Defect"</strong> next to the item to file an immediate corrective task.</li>
                <li>Tap <strong>Submit Report</strong> at the bottom of the page when done.</li>
              </ol>
            </div>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm open:shadow-md transition-all">
            <summary className="flex items-center gap-3 p-5 font-bold text-lg cursor-pointer text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 list-none [&::-webkit-details-marker]:hidden">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                <Wrench className="h-5 w-5" />
              </div>
              Managing Tasks & Concerns
              <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
              <p className="mt-3 text-sm sm:text-base">There are two ways to get tasks:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2 text-sm sm:text-base">
                <li><strong>Assigned to You:</strong> Tasks assigned to you appear under "My Tasks" on the Dashboard.</li>
                <li><strong>Claiming Unassigned:</strong> If a task in your property is open, it appears in "Unassigned Tasks". Tap it and hit <strong>Take Task</strong> to assign it to yourself.</li>
              </ul>
              <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">Filing a New Task manually:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2 text-sm sm:text-base">
                <li>Tap the <strong>File a Task</strong> button next to "My Tasks".</li>
                <li>Describe the issue, set the severity, and select the property.</li>
                <li>It will instantly be filed and assigned to you so you can log your work.</li>
              </ul>
            </div>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm open:shadow-md transition-all">
            <summary className="flex items-center gap-3 p-5 font-bold text-lg cursor-pointer text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 list-none [&::-webkit-details-marker]:hidden">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              Viewing Activity History
              <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
              <p className="mt-3 text-sm sm:text-base">You can view all your past activity, including completed inspections, filed tasks, and assigned tasks, by tapping the <strong>History</strong> button in the bottom navigation bar.</p>
              <p className="mt-2 text-sm sm:text-base">Use the <strong>From Date / To Date</strong> filters at the top of the history page to find records from specific days.</p>
            </div>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm open:shadow-md transition-all">
            <summary className="flex items-center gap-3 p-5 font-bold text-lg cursor-pointer text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 list-none [&::-webkit-details-marker]:hidden">
              <div className="bg-purple-100 text-purple-700 p-2 rounded-lg">
                <ShieldAlert className="h-5 w-5" />
              </div>
              Administrator Guides
              <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
              <p className="mt-3 text-sm sm:text-base">If you are an Administrator, you have access to the Admin Panel.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2 text-sm sm:text-base">
                <li><strong>Properties & Checkpoints:</strong> Use the left sidebar to navigate to Properties or Checkpoints to add new locations and generate printable QR codes.</li>
                <li><strong>User Management:</strong> Head to Personnel to invite users, assign them to Properties, and define their roles.</li>
                <li><strong>Reporting:</strong> Under the Reports tab, you can view comprehensive data tables for Inspections, Tasks, and Equipment. You can export these to CSV.</li>
              </ul>
            </div>
          </details>

        </div>
        
        <div className="block sm:hidden mt-8">
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full h-12">Back to Dashboard</Button>
            </Link>
        </div>

      </div>
    </div>
  );
}
