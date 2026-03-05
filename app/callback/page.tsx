"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CallbackPage() {

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {

    const connectSpotify = async () => {

      const code = searchParams.get("code");

      if (!code) {
        router.push("/profile");
        return;
      }

      try {

        const response = await fetch("/api/spotify/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!data.success) {
          router.push("/profile");
          return;
        }

        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
          router.push("/login");
          return;
        }

        await supabase
          .from("profiles")
          .update({
            spotify_id: data.spotify_id
          })
          .eq("id", authData.user.id);

        router.push("/profile");

      } catch (error) {

        console.error(error);
        router.push("/profile");

      }

    };

    connectSpotify();

  }, []);

  return (

    <div className="flex items-center justify-center h-screen text-white">

      <h1 className="text-xl">
        Conectando con Spotify...
      </h1>

    </div>

  );

}