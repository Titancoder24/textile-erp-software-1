"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
}

/**
 * Client-side hook for managing user notifications with real-time Supabase
 * subscriptions. Fetches the latest 50 notifications for the current user
 * and subscribes to INSERT events so new notifications appear immediately.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<number>(0);

  const supabase = React.useMemo(() => createClient(), []);

  const refresh = React.useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // Resolve current user id once
  React.useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) {
        setUserId(data.user?.id ?? null);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUserId(session?.user?.id ?? null);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch notifications when userId changes
  React.useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId as string)
          .order("created_at", { ascending: false })
          .limit(50);

        if (fetchError) throw new Error(fetchError.message);
        if (!cancelled) {
          setNotifications((data as Notification[]) ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId, refreshToken]);

  // Real-time subscription for new notifications
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const markAsRead = React.useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      // The generated Database types infer Update as never for some tables;
      // cast to any to work around this known Supabase codegen limitation.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { error: updateError } = await db
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (updateError) {
        // Revert on error
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
        );
        setError(new Error(updateError.message));
      }
    },
    [supabase]
  );

  const markAllAsRead = React.useCallback(async () => {
    if (!userId) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    // Same cast as in markAsRead – generated Update type is never for this table.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { error: updateError } = await db
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (updateError) {
      // Revert on error by refreshing
      setError(new Error(updateError.message));
      refresh();
    }
  }, [supabase, userId, refresh]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
