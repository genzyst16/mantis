"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Loader2, Edit, MapPin } from "lucide-react";
import { updateCheckpoint } from "@/app/admin/checkpoints/actions";

export function EditCheckpointModal({ checkpoint, properties, equipment, templates }: { checkpoint: any, properties: any[], equipment: any[], templates: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(checkpoint.checkpoint_name);
  const [propertyId, setPropertyId] = useState(checkpoint.property_id || "");
  const [equipmentId, setEquipmentId] = useState(checkpoint.equipment_id || "none");
  const [templateId, setTemplateId] = useState(checkpoint.inspection_templates?.[0]?.id || "none");
  
  const [requiresGeofence, setRequiresGeofence] = useState(checkpoint.requires_geofence || false);
  const [latitude, setLatitude] = useState(checkpoint.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(checkpoint.longitude?.toString() || "");
  const [radius, setRadius] = useState(checkpoint.allowed_radius_meters?.toString() || "35");

  const filteredEquipment = equipment.filter(eq => !propertyId || eq.property_id === propertyId);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setRequiresGeofence(true);
      },
      (error) => {
        alert("Unable to retrieve your location. Please check your permissions.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return alert("Property is required");
    
    setIsSubmitting(true);
    const result = await updateCheckpoint(checkpoint.id, {
      name,
      property_id: propertyId,
      equipment_id: equipmentId === "none" ? undefined : equipmentId,
      template_id: templateId === "none" ? undefined : templateId,
      requires_geofence: requiresGeofence,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseFloat(radius) : undefined
    });

    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-slate-500 hover:text-emerald-600" title="Edit Checkpoint" />}>
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Checkpoint: {checkpoint.checkpoint_code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Checkpoint Name</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property (Required)</Label>
              <Select onValueChange={(v) => v && setPropertyId(v)} value={propertyId}>
                <SelectTrigger>
                  <span className="truncate flex-1 text-left">{propertyId ? properties.find(p => p.id === propertyId)?.property_name : "Select Property"}</span>
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.property_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipment (Optional)</Label>
              <Select onValueChange={(v) => v && setEquipmentId(v)} value={equipmentId} disabled={!propertyId}>
                <SelectTrigger>
                  <span className="truncate flex-1 text-left">{equipmentId !== "none" ? equipment.find(e => e.id === equipmentId)?.equipment_name : "No Equipment"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Equipment</SelectItem>
                  {filteredEquipment.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.equipment_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inspection Template (Optional)</Label>
            <Select onValueChange={(v) => v && setTemplateId(v)} value={templateId}>
              <SelectTrigger>
                <span className="truncate flex-1 text-left">{templateId !== "none" ? templates.find(t => t.id === templateId)?.template_name : "No Template"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Template</SelectItem>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={`requiresGeofence-${checkpoint.id}`}
                  checked={requiresGeofence} 
                  onChange={e => setRequiresGeofence(e.target.checked)} 
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                />
                <Label htmlFor={`requiresGeofence-${checkpoint.id}`} className="font-semibold cursor-pointer">Require Geofence / Location Validation</Label>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleGetLocation}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <MapPin className="mr-2 h-4 w-4" /> Get Current Location
              </Button>
            </div>

            {requiresGeofence && (
              <div className="grid grid-cols-3 gap-4 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" required value={latitude} onChange={e => setLatitude(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" required value={longitude} onChange={e => setLongitude(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Radius (m)</Label>
                  <Input type="number" required value={radius} onChange={e => setRadius(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

