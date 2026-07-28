"use server";

import webPush from "web-push";
import { createClient } from "@/lib/supabase/server";

// Set VAPID details
webPush.setVapidDetails(
  "mailto:admin@mantis.local", // In production, use a real email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function subscribeToPush(subscription: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "user_id, endpoint" }
  );

  if (error) {
    console.error("Error saving subscription:", error);
    return { error: "Failed to save subscription" };
  }

  // Send a welcome notification
  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Notifications Enabled!",
        body: "You will now receive MANTIS alerts on this device.",
        url: "/dashboard"
      })
    );
  } catch (err) {
    console.error("Error sending welcome notification:", err);
  }

  return { success: true };
}

// Utility for sending notifications to a specific user (can be called from other server actions)
export async function sendNotificationToUser(userId: string, title: string, body: string, url: string = "/") {
  const supabase = await createClient();
  
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url });

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webPush.sendNotification(pushSubscription, payload);
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        // Subscription has expired or is no longer valid, remove it
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }
}
