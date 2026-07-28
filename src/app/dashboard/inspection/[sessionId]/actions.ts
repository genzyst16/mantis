"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitInspection(
  sessionId: string, 
  formData: any, 
  finalLat: number, 
  finalLon: number, 
  finalAcc: number,
  photoHashes: Record<string, string>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify session
  const { data: session, error: sessionError } = await supabase
    .from("scan_sessions")
    .select("*, checkpoints(*)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return { error: "Invalid inspection session." };
  }

  if (session.status !== "ACTIVE" || new Date(session.expires_at) < new Date()) {
    return { error: "Scan session has expired or is invalid. Please scan the QR code again." };
  }

  const checkpoint = session.checkpoints as any;

  // Haversine check for final submission
  const R = 6371e3; 
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRadians(finalLat - checkpoint.latitude);
  const dLon = toRadians(finalLon - checkpoint.longitude);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(checkpoint.latitude)) * Math.cos(toRadians(finalLat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const finalDistance = R * c;

  let verificationStatus = "Verified";
  let isFlagged = false;

  if (finalDistance > checkpoint.allowed_radius_meters) {
    verificationStatus = "Flagged";
    isFlagged = true;
  }
  
  if (finalAcc > checkpoint.maximum_accuracy_meters) {
    verificationStatus = isFlagged ? "Flagged" : "Partially Verified";
  }

  // Duplicate Photo Detection
  let hasDuplicatePhoto = false;
  const hashes = Object.values(photoHashes);
  
  if (hashes.length > 0) {
    const { data: existingPhotos, error: dupError } = await supabase
      .from("inspection_photos")
      .select("id")
      .in("file_hash", hashes)
      .limit(1);
      
    if (!dupError && existingPhotos && existingPhotos.length > 0) {
      hasDuplicatePhoto = true;
      verificationStatus = "Flagged"; // Override status
    }
  }

  // Create Inspection Report
  const referenceNumber = `INS-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}-${Math.floor(Math.random() * 1000)}`;

  const { data: report, error: reportError } = await supabase
    .from("inspection_reports")
    .insert({
      reference_number: referenceNumber,
      scan_session_id: session.id,
      user_id: user.id,
      checkpoint_id: checkpoint.id,
      property_id: checkpoint.property_id,
      initial_latitude: session.initial_latitude,
      initial_longitude: session.initial_longitude,
      initial_accuracy: session.initial_accuracy,
      initial_distance_meters: session.initial_distance_meters,
      final_latitude: finalLat,
      final_longitude: finalLon,
      final_accuracy: finalAcc,
      final_distance_meters: finalDistance,
      verification_status: verificationStatus,
      is_locked: true,
      server_received_at: new Date().toISOString()
    })
    .select()
    .single();

  if (reportError || !report) {
    return { error: "Failed to save inspection report." };
  }

  // Insert values
  const valuesToInsert = Object.keys(formData).map(key => {
    const val = formData[key];
    return {
      report_id: report.id,
      field_key: key,
      text_value: typeof val === "string" ? val : null,
      numeric_value: typeof val === "number" ? val : null,
      boolean_value: typeof val === "boolean" ? val : null,
    };
  });

  if (valuesToInsert.length > 0) {
    await supabase.from("inspection_values").insert(valuesToInsert);
  }

  // Insert photos
  const photosToInsert = Object.keys(photoHashes).map(key => ({
    report_id: report.id,
    field_id: null, // Should match template field ID in a full implementation
    storage_path: key, // Using field key as simple identifier for MVP
    file_hash: photoHashes[key],
    mime_type: "image/jpeg",
    latitude: finalLat,
    longitude: finalLon,
    accuracy: finalAcc,
    is_duplicate: hasDuplicatePhoto
  }));

  if (photosToInsert.length > 0) {
    await supabase.from("inspection_photos").insert(photosToInsert);
  }

  // Invalidate scan session
  await supabase
    .from("scan_sessions")
    .update({ status: "USED", used_at: new Date().toISOString() })
    .eq("id", session.id);

  return { success: true, referenceNumber };
}
