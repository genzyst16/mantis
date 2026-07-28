"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { LivePhotoCapture } from "@/components/LivePhotoCapture";
import { submitInspection } from "./actions";
import localforage from "localforage";

export function ClientForm({ sessionId, templateFields }: { sessionId: string, templateFields: any[] }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [photoHashes, setPhotoHashes] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({}); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoCaptured = (key: string, base64: string, hash: string) => {
    setPhotos(prev => ({ ...prev, [key]: base64 }));
    setPhotoHashes(prev => ({ ...prev, [key]: hash }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    for (const field of templateFields) {
      if (field.is_required) {
        if (field.field_type === "photo") {
          if (!photos[field.field_key]) {
            setError(`Please capture ${field.field_label}`);
            setIsSubmitting(false);
            return;
          }
        } else {
          if (formData[field.field_key] === undefined || formData[field.field_key] === "") {
            setError(`Please fill in ${field.field_label}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
    }

    if (!navigator.geolocation) {
      setError("Geolocation is required for submission.");
      setIsSubmitting(false);
      return;
    }

    if (!navigator.onLine) {
      const pendingPayload = { sessionId, formData, photoHashes, timestamp: Date.now() };
      try {
        const pendingQueue: any[] = await localforage.getItem("mantis_pending_inspections") || [];
        pendingQueue.push(pendingPayload);
        await localforage.setItem("mantis_pending_inspections", pendingQueue);
        setIsSubmitting(false);
        router.push(`/dashboard?offline=true`);
        return;
      } catch (err) {
        setError("You are offline and we failed to save your inspection locally.");
        setIsSubmitting(false);
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const result = await submitInspection(sessionId, formData, latitude, longitude, accuracy, photoHashes);
          if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
          } else if (result.success) {
            router.push(`/dashboard?success=true&ref=${result.referenceNumber}`);
          }
        } catch (err) {
           setError("Network error during submission. Try again or wait to go offline.");
           setIsSubmitting(false);
        }
      },
      (geoError) => {
        setError("Failed to verify final location. Please ensure GPS is enabled.");
        setIsSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Form</CardTitle>
          <CardDescription>Complete the dynamic checklist. Location verified on submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {templateFields.map((field) => {
              
              if (field.field_type === "dropdown") {
                const options = field.options_json || [];
                return (
                  <div key={field.field_key} className="space-y-2">
                    <Label htmlFor={field.field_key}>{field.field_label} {field.is_required && <span className="text-red-500">*</span>}</Label>
                    <Select onValueChange={(val) => handleFieldChange(field.field_key, val)} value={formData[field.field_key] || ""}>
                      <SelectTrigger id={field.field_key}><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (field.field_type === "number" || field.field_type === "text") {
                const maxLength = field.validation_rules_json?.max_length;
                return (
                  <div key={field.field_key} className="space-y-2">
                    <Label htmlFor={field.field_key}>
                      {field.field_label} 
                      {field.is_required && <span className="text-red-500">*</span>}
                      {maxLength && <span className="text-slate-400 text-xs font-normal ml-2">(Max {maxLength} {field.field_type === 'number' ? 'digits' : 'chars'})</span>}
                    </Label>
                    <Input 
                      id={field.field_key} 
                      type={field.field_type} 
                      maxLength={field.field_type === 'text' ? maxLength : undefined}
                      value={formData[field.field_key] ?? ""}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (maxLength && val.length > maxLength) {
                          val = val.slice(0, maxLength);
                        }
                        // Handle numbers cleanly without breaking on negative signs or decimals
                        if (field.field_type === 'number') {
                          handleFieldChange(field.field_key, val === "" ? "" : Number(val));
                        } else {
                          handleFieldChange(field.field_key, val);
                        }
                      }}
                    />
                  </div>
                );
              }

              if (field.field_type === "textarea") {
                return (
                  <div key={field.field_key} className="space-y-2">
                    <Label htmlFor={field.field_key}>{field.field_label} {field.is_required && <span className="text-red-500">*</span>}</Label>
                    <Textarea 
                      id={field.field_key} 
                      value={formData[field.field_key] || ""}
                      onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                    />
                  </div>
                );
              }

              if (field.field_type === "photo") {
                return (
                  <div key={field.field_key} className="pt-2">
                    <LivePhotoCapture 
                      fieldKey={field.field_key} 
                      label={`${field.field_label} ${field.is_required ? '*' : ''}`} 
                      onPhotoCaptured={handlePhotoCaptured} 
                    />
                  </div>
                );
              }

              return null;
            })}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="mr-2 h-5 w-5" /> Submit Inspection</>
              )}
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
