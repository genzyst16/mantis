"use client";

import { useState, useEffect, useMemo } from "react";
import { getPropertiesWithCheckpoints, getCheckpointHistory } from "@/app/admin/reports/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ReportDetailsModal } from "@/components/ReportDetailsModal";

export function HistoricalReportsTab() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>("");
  const [reports, setReports] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    async function loadProps() {
      const data = await getPropertiesWithCheckpoints();
      setProperties(data);
      if (data.length > 0) {
        setSelectedProperty(data[0].id);
      }
      setLoadingProps(false);
    }
    loadProps();
  }, []);

  useEffect(() => {
    if (!selectedProperty) {
      setSelectedCheckpoint("");
      return;
    }
    const prop = properties.find(p => p.id === selectedProperty);
    if (prop && prop.checkpoints && prop.checkpoints.length > 0) {
      // Auto-select first checkpoint
      setSelectedCheckpoint(prop.checkpoints[0].id);
    } else {
      setSelectedCheckpoint("");
      setReports([]);
    }
  }, [selectedProperty, properties]);

  useEffect(() => {
    async function loadReports() {
      if (!selectedCheckpoint) {
        setReports([]);
        return;
      }
      setLoadingReports(true);
      const data = await getCheckpointHistory(selectedCheckpoint, startDate, endDate);
      setReports(data);
      setLoadingReports(false);
    }
    loadReports();
  }, [selectedCheckpoint, startDate, endDate]);

  const activeCheckpoints = properties.find(p => p.id === selectedProperty)?.checkpoints || [];

  // Extract unique field keys for dynamic columns
  const dynamicColumns = useMemo(() => {
    const keys = new Set<string>();
    reports.forEach(report => {
      if (report.inspection_values) {
        report.inspection_values.forEach((v: any) => keys.add(v.field_key));
      }
    });
    return Array.from(keys).sort(); // Sort alphabetically
  }, [reports]);

  const templateFields = useMemo(() => {
    if (reports.length > 0 && reports[0].checkpoints?.inspection_templates?.inspection_template_fields) {
      return reports[0].checkpoints.inspection_templates.inspection_template_fields;
    }
    return [];
  }, [reports]);

  const formatKeyToLabel = (key: string) => {
    const field = templateFields.find((f: any) => f.field_key === key);
    if (field && field.field_label) return field.field_label;
    return key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Historical Checkpoint Data</CardTitle>
        <CardDescription>
          Select a checkpoint to view a timeline of all recorded parameters based on its assigned templates.
        </CardDescription>
        
        {loadingProps ? (
          <div className="flex items-center text-sm text-slate-500 pt-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading properties...
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="w-full sm:w-64">
                <Select onValueChange={(v) => v && setSelectedProperty(v)} value={selectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property...">
                      {properties.find(p => p.id === selectedProperty)?.property_name || "Select property..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.property_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-64">
                <Select 
                  onValueChange={(v) => v && setSelectedCheckpoint(v)} 
                  value={selectedCheckpoint}
                  disabled={activeCheckpoints.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={activeCheckpoints.length === 0 ? "No checkpoints found" : "Select checkpoint..."}>
                      {activeCheckpoints.find((c: any) => c.id === selectedCheckpoint)?.checkpoint_name || (activeCheckpoints.length === 0 ? "No checkpoints found" : "Select checkpoint...")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {activeCheckpoints.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.checkpoint_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full sm:w-auto">
                <input 
                  type="date" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Start Date"
                />
              </div>
              <div className="text-slate-500 text-sm hidden sm:block">to</div>
              <div className="w-full sm:w-auto">
                <input 
                  type="date" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="End Date"
                />
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loadingReports ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : !selectedCheckpoint ? (
          <div className="text-center py-12 text-slate-500 border rounded-lg border-dashed">
            Please select a checkpoint to view its historical data.
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border rounded-lg border-dashed">
            No inspection reports found for this checkpoint.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-max">
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="sticky left-0 bg-slate-50 dark:bg-slate-900/50 z-10 w-48 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">Date</TableHead>
                  <TableHead>Personnel</TableHead>
                  <TableHead>Status</TableHead>
                  {dynamicColumns.map(col => (
                    <TableHead key={col} className="whitespace-nowrap text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20">
                      {formatKeyToLabel(col)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  // Map values by field key for easy lookup
                  const valuesMap: Record<string, any> = {};
                  if (report.inspection_values) {
                    report.inspection_values.forEach((v: any) => {
                      valuesMap[v.field_key] = v.text_value ?? v.numeric_value ?? (v.boolean_value !== null ? (v.boolean_value ? "Yes" : "No") : "N/A");
                    });
                  }
                  
                  return (
                    <TableRow key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/25">
                      <TableCell className="sticky left-0 bg-white dark:bg-slate-950 z-10 whitespace-nowrap shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">
                        {new Date(report.created_at).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric', 
                          hour: 'numeric', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {report.profiles?.full_name || report.profiles?.email || "Unknown"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(report.verification_status)}
                      </TableCell>
                      
                      {dynamicColumns.map(col => {
                        const fieldDef = templateFields.find((f: any) => f.field_key === col);
                        const isPhoto = fieldDef?.field_type === 'photo';
                        const val = valuesMap[col];
                        
                        return (
                          <TableCell key={col} className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {isPhoto && val ? (
                              <div className="rounded overflow-hidden w-12 h-12 bg-black flex items-center justify-center">
                                <img src={val} alt="Photo" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              val || <span className="text-slate-300 dark:text-slate-700">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      
                      <TableCell className="text-right">
                        <ReportDetailsModal reportId={report.id} referenceNumber={report.reference_number} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
