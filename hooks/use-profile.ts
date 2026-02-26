"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Client-side hook to fetch the current authenticated user's profile.
 * Useful in client components that need profile data without prop drilling.
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<number>(0);

  const supabase = React.useMemo(() => createClient(), []);

  const refresh = React.useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(authError.message);
        }

        if (!user) {
          if (!cancelled) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (!cancelled) {
          setProfile(data as Profile);
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

    fetchProfile();

    // Listen for auth state changes (sign-in / sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) {
        fetchProfile();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, refreshToken]);

  return { profile, loading, error, refresh };
}
