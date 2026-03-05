"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {

  const router = useRouter();

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      router.push("/profile");
      return;
    }

    async function connectSpotify() {

      try {

        const res = await fetch(`/api/spotify/callback?code=${code}`);

        if (res.ok) {
          router.push("/profile");
        } else {
          router.push("/profile");
        }

      } catch (err) {
        router.push("/profile");
      }

    }

    connectSpotify();

  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      Conectando con Spotify...
    </div>
  );

}