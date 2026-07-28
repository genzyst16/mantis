"use server";

import { createClient } from "@/lib/supabase/server";

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

export async function checkCheckpointRequirements(qrToken: string) {
  const supabase = await createClient();
  const { data: checkpoint, error } = await supabase
    .from("checkpoints")
    .select("requires_geofence")
    .eq("qr_token_hash", qrToken)
    .eq("is_active", true)
    .single();
    
  if (error || !checkpoint) return { error: "Invalid or inactive checkpoint QR code." };
  
  return { requiresGeofence: checkpoint.requires_geofence };
}

export async function validateScanAndLocation(
  qrToken: string,
  userLat: number | null,
  userLon: number | null,
  accuracy: number | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Find checkpoint
  const { data: checkpoint, error: cpError } = await supabase
    .from("checkpoints")
    .select("*")
    .eq("qr_token_hash", qrToken)
    .eq("is_active", true)
    .single();

  if (cpError || !checkpoint) {
    return { error: "Invalid or inactive checkpoint QR code." };
  }

  let distance: number | null = null;

  if (checkpoint.requires_geofence) {
    if (userLat === null || userLon === null || accuracy === null) {
      return { error: "Location is strictly required for this checkpoint. Please enable GPS." };
    }
    
    // Check GPS accuracy
    if (accuracy > checkpoint.maximum_accuracy_meters) {
      return { error: `GPS accuracy (${Math.round(accuracy)}m) is worse than required (${checkpoint.maximum_accuracy_meters}m). Please wait for a better signal.` };
    }

    // Calculate distance
    distance = calculateDistance(userLat, userLon, checkpoint.latitude, checkpoint.longitude);

    if (distance > checkpoint.allowed_radius_meters) {
      return { 
        error: `Location verification failed. You are approximately ${Math.round(distance)} meters away. Allowed radius is ${checkpoint.allowed_radius_meters} meters.`
      };
    }
  }

  // Create scan session
  const expiresAt = new Date(Date.now() + 90 * 1000); // 90 seconds expiration
  
  const { data: session, error: sessionError } = await supabase
    .from("scan_sessions")
    .insert({
      user_id: user.id,
      checkpoint_id: checkpoint.id,
      expires_at: expiresAt.toISOString(),
      initial_latitude: userLat,
      initial_longitude: userLon,
      initial_accuracy: accuracy,
      initial_distance_meters: distance,
      status: "ACTIVE"
    })
    .select()
    .single();

  if (sessionError || !session) {
    return { error: "Failed to create inspection session." };
  }

  return { success: true, sessionId: session.id, checkpointName: checkpoint.checkpoint_name };
}
