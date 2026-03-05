"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LastFmSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const updateProfile = async () => {
      const username = searchParams.get("username");

      if (!username) {
        router.push("/setup");
        return;
      }

      // 🔥 Esperar a que Supabase cargue la sesión
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      await supabase
        .from("profiles")
        .update({ lastfm_username: username })
        .eq("id", userId);

      router.push("/profile");
    };

    updateProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Conectando con Last.fm...</p>
    </div>
  );
}