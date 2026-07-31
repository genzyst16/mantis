"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProperty(propertyName: string, propertyCode: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert({
    property_name: propertyName,
    property_code: propertyCode
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function updateProperty(id: string, propertyName: string, propertyCode: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").update({
    property_name: propertyName,
    property_code: propertyCode,
    is_active: isActive
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function addEquipment(data: {
  equipment_code: string;
  equipment_name: string;
  equipment_category: string;
  property_id: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("equipment").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/admin/equipment");
  return { success: true };
}

export async function createTemplate(name: string, description: string, fields: any[]) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  // 1. Insert template
  const { data: template, error: tError } = await supabase
    .from("inspection_templates")
    .insert({
      template_name: name,
      description,
      created_by: user.user?.id
    })
    .select()
    .single();

  if (tError || !template) return { error: tError?.message || "Failed to create template" };

  // 2. Insert fields
  const fieldsToInsert = fields.map((f, idx) => ({
    template_id: template.id,
    field_key: f.field_key,
    field_label: f.field_label,
    field_type: f.field_type,
    is_required: f.is_required,
    display_order: idx,
    options_json: f.options ? f.options : null,
    validation_rules_json: f.max_length ? { max_length: f.max_length } : null
  }));

  const { error: fError } = await supabase.from("inspection_template_fields").insert(fieldsToInsert);
  
  if (fError) return { error: fError.message };
  
  revalidatePath("/admin/templates");
  return { success: true };
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  // We'll soft-delete by setting is_active = false to prevent breaking existing reports/checkpoints
  const { error } = await supabase
    .from("inspection_templates")
    .update({ is_active: false })
    .eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/templates");
  return { success: true };
}

export async function updateTemplate(id: string, name: string, description: string, fields: any[]) {
  const supabase = await createClient();
  
  // 1. Update template basic info
  const { error: tError } = await supabase
    .from("inspection_templates")
    .update({ template_name: name, description })
    .eq("id", id);

  if (tError) return { error: tError.message };

  // 2. Delete old fields
  await supabase.from("inspection_template_fields").delete().eq("template_id", id);

  // 3. Insert new fields
  const fieldsToInsert = fields.map((f, idx) => ({
    template_id: id,
    field_key: f.field_key,
    field_label: f.field_label,
    field_type: f.field_type,
    is_required: f.is_required,
    display_order: idx,
    options_json: f.options ? f.options : null,
    validation_rules_json: f.max_length ? { max_length: f.max_length } : null
  }));

  const { error: fError } = await supabase.from("inspection_template_fields").insert(fieldsToInsert);
  
  if (fError) return { error: fError.message };
  
  revalidatePath("/admin/templates");
  return { success: true };
}
