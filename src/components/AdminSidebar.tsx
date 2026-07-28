"use client";

import { useState } from "react";
import { LogOut, Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebarNav } from "@/components/AdminSidebarNav";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-slate-900 text-slate-300 hidden md:flex flex-col transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("p-4 flex items-center border-b border-slate-800 h-16 shrink-0", isCollapsed ? "justify-center" : "justify-end")}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      
      <AdminSidebarNav isCollapsed={isCollapsed} />

      <div className="p-4 border-t border-slate-800">
        <form action="/auth/signout" method="post">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-300 hover:text-white hover:bg-slate-800",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )} 
            type="submit"
            title="Sign Out"
          >
            <LogOut size={20} className={cn(!isCollapsed && "mr-3")} /> 
            {!isCollapsed && "Sign Out"}
          </Button>
        </form>
      </div>
    </aside>
  );
}
