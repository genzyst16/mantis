"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCheckpoint(data: {
  name: string;
  property_id: string;
  equipment_id?: string;
  template_id?: string;
  requires_geofence: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Generate the Checkpoint Code (EquipmentCode-YYYYMMDD-0000)
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
  
  let prefix = "PROP";
  if (data.equipment_id) {
    const { data: eq } = await supabase.from("equipment").select("equipment_code").eq("id", data.equipment_id).single();
    if (eq?.equipment_code) prefix = eq.equipment_code;
  } else if (data.property_id) {
    const { data: prop } = await supabase.from("properties").select("property_code").eq("id", data.property_id).single();
    if (prop?.property_code) prefix = prop.property_code;
  }

  // Count existing checkpoints created today with this prefix
  const { count } = await supabase
    .from("checkpoints")
    .select("*", { count: 'exact', head: true })
    .like("checkpoint_code", `${prefix}-${dateStr}-%`);

  const sequence = ((count || 0) + 1).toString().padStart(4, "0");
  const checkpoint_code = `${prefix}-${dateStr}-${sequence}`;

  // 2. Generate secure token for QR
  const qr_token_hash = `MCT-CHK-${crypto.randomUUID()}`;

  // 3. Insert
  const { data: newCp, error } = await supabase.from("checkpoints").insert({
    checkpoint_code,
    checkpoint_name: data.name,
    property_id: data.property_id,
    equipment_id: data.equipment_id || null,
    requires_geofence: data.requires_geofence,
    latitude: data.requires_geofence ? data.latitude : null,
    longitude: data.requires_geofence ? data.longitude : null,
    allowed_radius_meters: data.requires_geofence ? data.radius : null,
    qr_token_hash,
  }).select().single();

  if (error) return { error: error.message };

  if (data.template_id) {
    await supabaseAdmin.from("checkpoint_templates").insert({
      checkpoint_id: newCp.id,
      template_id: data.template_id
    });
  }

  revalidatePath("/admin/checkpoints");
  return { success: true };
}

export async function updateCheckpoint(id: string, data: {
  name: string;
  property_id: string;
  equipment_id?: string;
  template_id?: string;
  requires_geofence: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabase.from("checkpoints").update({
    checkpoint_name: data.name,
    property_id: data.property_id,
    equipment_id: data.equipment_id || null,
    requires_geofence: data.requires_geofence,
    latitude: data.requires_geofence ? data.latitude : null,
    longitude: data.requires_geofence ? data.longitude : null,
    allowed_radius_meters: data.requires_geofence ? data.radius : null,
  }).eq("id", id);

  if (error) return { error: error.message };

  await supabaseAdmin.from("checkpoint_templates").delete().eq("checkpoint_id", id);
  if (data.template_id) {
    await supabaseAdmin.from("checkpoint_templates").insert({
      checkpoint_id: id,
      template_id: data.template_id
    });
  }

  revalidatePath("/admin/checkpoints");
  return { success: true };
}

export async function deleteCheckpoint(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("checkpoints").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/checkpoints");
  return { success: true };
}
