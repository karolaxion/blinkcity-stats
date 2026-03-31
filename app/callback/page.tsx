"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {

  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {

    const code = params.get("code");

    if (!code) {
      router.push("/");
      return;
    }

    async function getToken() {

      const res = await fetch("/api/spotify/token?code=" + code);
      const data = await res.json();

      if (data.access_token) {

        localStorage.setItem("spotify_token", data.access_token);

        router.push("/profile");

      } else {

        router.push("/");

      }

    }

    getToken();

  }, []);

  return <div>Conectando Spotify...</div>;

}