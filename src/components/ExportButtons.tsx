"use client";

import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExportButtonsProps {
  filename: string;
  pdfTitle: string;
  pdfColumns: string[];
  pdfRows: (string | number)[][];
  excelData: Record<string, any>[];
  disabled?: boolean;
}

export function ExportButtons({ filename, pdfTitle, pdfColumns, pdfRows, excelData, disabled }: ExportButtonsProps) {
  
  const exportToExcel = () => {
    if (excelData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (pdfRows.length === 0) return;
    const doc = new jsPDF();
    
    doc.text(pdfTitle, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

    // @ts-ignore - jspdf-autotable extends jsPDF but types can be tricky
    doc.autoTable({
      head: [pdfColumns],
      body: pdfRows,
      startY: 28,
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const noData = excelData.length === 0;

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToExcel} 
        disabled={disabled || noData}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      >
        <FileDown className="mr-2 h-4 w-4" /> Export Excel
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToPDF} 
        disabled={disabled || noData}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        <Download className="mr-2 h-4 w-4" /> Export PDF
      </Button>
    </div>
  );
}
