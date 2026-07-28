"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCategory(name: string, description: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("equipment_categories").insert({
    name,
    description
  });
  
  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories");
  revalidatePath("/admin/equipment");
  return { success: true };
}
