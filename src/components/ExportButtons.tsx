"use client";

import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function ExportButtons({ reports }: { reports: any[] }) {
  
  const exportToExcel = () => {
    const data = reports.map(r => ({
      "Reference Number": r.reference_number,
      "Checkpoint": r.checkpoints?.checkpoint_name || "Unknown",
      "Personnel": r.profiles?.full_name || r.profiles?.email || "Unknown",
      "Date": new Date(r.created_at).toLocaleDateString(),
      "Time": new Date(r.created_at).toLocaleTimeString(),
      "Status": r.verification_status,
      "Distance (m)": r.final_distance_meters ? Math.round(r.final_distance_meters) : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inspections");
    XLSX.writeFile(wb, `MANTIS_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text("MANTIS Inspection Reports", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Reference", "Checkpoint", "Personnel", "Date & Time", "Status", "Dist(m)"];
    const tableRows = reports.map(r => [
      r.reference_number,
      r.checkpoints?.checkpoint_name || "Unknown",
      r.profiles?.full_name || r.profiles?.email || "Unknown",
      new Date(r.created_at).toLocaleString(),
      r.verification_status,
      r.final_distance_meters ? Math.round(r.final_distance_meters).toString() : "N/A"
    ]);

    // @ts-ignore - jspdf-autotable extends jsPDF but types can be tricky
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
    });

    doc.save(`MANTIS_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToExcel} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
        <FileDown className="mr-2 h-4 w-4" /> Export Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportToPDF} className="border-red-200 text-red-700 hover:bg-red-50">
        <Download className="mr-2 h-4 w-4" /> Export PDF
      </Button>
    </div>
  );
}
