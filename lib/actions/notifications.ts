"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

export async function getNotifications(userId: string, limit: number = 20) {
  const supabase = await createClient();

  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient();

  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: count ?? 0, error: null };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();

  if (!notificationId) {
    return { data: null, error: "Notification ID is required" };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function markAllAsRead(userId: string) {
  const supabase = await createClient();

  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: true, error: null };
}

export async function createNotification(data: NotificationInsert) {
  const supabase = await createClient();

  if (!data.user_id) {
    return { data: null, error: "User ID is required" };
  }
  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.title) {
    return { data: null, error: "Notification title is required" };
  }
  if (!data.message) {
    return { data: null, error: "Notification message is required" };
  }

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({ ...data, is_read: false })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: notification, error: null };
}
