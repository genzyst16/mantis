"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function AuditLogsExportButtons({ logs }: { logs: any[] }) {
  const formatDataForExport = () => {
    return logs.map(log => ({
      Timestamp: new Date(log.created_at).toLocaleString(),
      User: log.profiles?.full_name || log.profiles?.email || 'System',
      Action: log.action,
      Entity: log.entity_type,
      "Entity ID": log.entity_id,
      "Previous Values": log.previous_values_json ? JSON.stringify(log.previous_values_json) : "N/A",
      "New Values": log.new_values_json ? JSON.stringify(log.new_values_json) : "N/A"
    }));
  };

  const exportToExcel = () => {
    const data = formatDataForExport();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
    XLSX.writeFile(workbook, `Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    
    // Add Title
    doc.setFontSize(18);
    doc.text("Audit Logs Report", 14, 22);
    
    // Add generation date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const data = formatDataForExport();
    
    // Prepare table data
    const tableColumn = ["Timestamp", "User", "Action", "Entity", "Previous Values", "New Values"];
    const tableRows = data.map(log => [
      log.Timestamp,
      log.User,
      log.Action,
      log.Entity,
      log["Previous Values"].substring(0, 50) + (log["Previous Values"].length > 50 ? "..." : ""),
      log["New Values"].substring(0, 50) + (log["New Values"].length > 50 ? "..." : "")
    ]);

    // @ts-ignore - jspdf-autotable extends jsPDF but types might complain
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [15, 23, 42] }, // slate-900
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      columnStyles: {
        0: { cellWidth: 35 }, // Timestamp
        1: { cellWidth: 35 }, // User
        2: { cellWidth: 20 }, // Action
        3: { cellWidth: 30 }, // Entity
        4: { cellWidth: 70 }, // Previous
        5: { cellWidth: 70 }, // New
      },
    });

    doc.save(`Audit_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!logs || logs.length === 0) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToExcel} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportToPDF} className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
