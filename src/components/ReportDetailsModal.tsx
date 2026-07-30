"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Loader2, MapPin } from "lucide-react";
import { getReportDetails } from "@/app/admin/reports/actions";
import { Badge } from "@/components/ui/badge";

export function ReportDetailsModal({ reportId, referenceNumber }: { reportId: string, referenceNumber: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !report) {
      setLoading(true);
      const data = await getReportDetails(reportId);
      setReport(data);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-emerald-500">{status}</Badge>;
      case "Partially Verified":
        return <Badge className="bg-amber-500">{status}</Badge>;
      case "Flagged":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-9 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
        <FileText className="h-4 w-4 mr-2" /> View Details
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details: {referenceNumber}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : report ? (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
              <div>
                <p className="text-slate-500 font-medium mb-1">Property</p>
                <p className="font-semibold">{report.properties?.property_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Checkpoint</p>
                <p className="font-semibold">{report.checkpoints?.checkpoint_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Personnel</p>
                <p className="font-semibold">{report.profiles?.full_name || report.profiles?.email || "Unknown"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Date</p>
                <p className="font-semibold">{new Date(report.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Status</p>
                <div>{getStatusBadge(report.verification_status)}</div>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">Location Variance</p>
                <p className="font-semibold flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                  {report.final_distance_meters !== null ? `${Math.round(report.final_distance_meters)} meters away` : "N/A"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Recorded Parameters</h3>
              {(!report.inspection_values || report.inspection_values.length === 0) ? (
                <p className="text-slate-500 text-sm">No custom parameters were recorded for this checkpoint.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.inspection_values.map((val: any) => {
                    const templateFields = report.checkpoints?.inspection_templates?.inspection_template_fields || [];
                    const fieldDef = templateFields.find((f: any) => f.field_key === val.field_key);
                    
                    const label = fieldDef?.field_label || val.field_key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const isPhoto = fieldDef?.field_type === "photo";
                    
                    const displayValue = val.text_value ?? val.numeric_value ?? (val.boolean_value !== null ? (val.boolean_value ? "Yes" : "No") : "N/A");
                    
                    return (
                      <div key={val.id} className="bg-white dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-xs text-slate-500 mb-2">{label}</p>
                        {isPhoto && val.text_value ? (
                          <div className="rounded overflow-hidden">
                            <img src={val.text_value} alt={label} className="w-full h-auto max-h-48 object-contain bg-black rounded" />
                          </div>
                        ) : (
                          <p className="font-medium">{displayValue}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {report.remarks && (
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-2">Remarks</h3>
                <p className="text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-100 dark:border-amber-900/50">
                  {report.remarks}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">Failed to load report data.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
