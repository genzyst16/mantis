"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building, FileCode, MapPin, ListTree, Map, Clock, FileText, Wrench, Settings, Users, Activity, Shield, BookOpen, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/map", label: "Map Reports", icon: Map },
    ]
  },
  {
    title: "Facilities",
    items: [
      { href: "/admin/properties", label: "Properties", icon: Building },
      { href: "/admin/equipment", label: "Equipment", icon: Settings },
    ]
  },
  {
    title: "Inspections",
    items: [
      { href: "/admin/checkpoints", label: "Checkpoints", icon: MapPin },
      { href: "/admin/tasks", label: "Tasks", icon: Wrench },
      { href: "/admin/schedules", label: "Schedules", icon: Clock },
    ]
  },
  {
    title: "System & Data",
    items: [
      { href: "/admin/reports", label: "Reports", icon: FileText },
      { href: "/admin/templates", label: "Templates", icon: FileCode },
      { href: "/admin/categories", label: "Categories", icon: ListTree },
      { href: "/admin/personnel", label: "Users", icon: Users },
      { href: "/admin/roles", label: "Roles", icon: Shield },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity },
    ]
  },
  {
    title: "Help & Info",
    items: [
      { href: "/help", label: "Help & Guides", icon: BookOpen },
      { href: "/about", label: "Documentation", icon: Info },
    ]
  }
];

export function AdminSidebarNav({ isCollapsed }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              // Exact match for dashboard, prefix match for others to keep active state when viewing details
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname.startsWith(item.href);

              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isCollapsed ? "justify-center" : "",
                    isActive 
                      ? "bg-slate-800 text-emerald-400 font-medium" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                  {!isCollapsed && item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
