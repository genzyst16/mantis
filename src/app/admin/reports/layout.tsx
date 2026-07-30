import { ReactNode } from "react";
import Link from "next/link";
import { FileText, CheckSquare, Activity, Building2 } from "lucide-react";

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Export and analyze system data across different modules.</p>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <Link
            href="/admin/reports/inspections"
            className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
          >
            <FileText className="h-4 w-4" /> Inspections
          </Link>
          <Link
            href="/admin/reports/tasks"
            className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
          >
            <CheckSquare className="h-4 w-4" /> Tasks
          </Link>
          <Link
            href="/admin/reports/equipment"
            className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
          >
            <Activity className="h-4 w-4" /> Equipment
          </Link>
          <Link
            href="/admin/reports/properties"
            className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
          >
            <Building2 className="h-4 w-4" /> Properties
          </Link>
        </nav>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
