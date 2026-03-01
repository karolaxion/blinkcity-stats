export const dynamic = "force-dynamic";

"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;

    const processLogin = async () => {
      const res = await fetch("/api/spotify/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const tokenData = await res.json();
      const accessToken = tokenData.access_token;
      if (!accessToken) return;

      const profileRes = await fetch(
        "https://api.spotify.com/v1/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const profile = await profileRes.json();

      localStorage.setItem(
        "blinkcity_user",
        JSON.stringify({
          id: profile.id,
          name: profile.display_name,
        })
      );

      router.push("/profile");
    };

    processLogin();
  }, [code]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1>Iniciando sesión...</h1>
    </div>
  );
}