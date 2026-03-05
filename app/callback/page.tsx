"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {

    const code = searchParams.get("code");

    if (!code) {
      router.push("/profile");
      return;
    }

    async function connectSpotify() {

      const res = await fetch(`/api/spotify/callback?code=${code}`);

      if (res.ok) {
        router.push("/profile");
      } else {
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