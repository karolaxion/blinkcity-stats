"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LastFmCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const handleLastFm = async () => {
      if (!token) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      await fetch(`/api/lastfm/session?token=${token}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      router.push("/setup");
    };

    handleLastFm();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Conectando Last.fm...</p>
    </div>
  );
}