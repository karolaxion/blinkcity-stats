"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LastfmCallbackPage() {

  const router = useRouter();

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      router.push("/profile");
      return;
    }

    async function connectLastfm() {

      try {

        const res = await fetch(`/api/lastfm/callback?token=${token}`);

        if (res.ok) {
          router.push("/profile");
        } else {
          router.push("/profile");
        }

      } catch (err) {
        router.push("/profile");
      }

    }

    connectLastfm();

  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      Conectando con Last.fm...
    </div>
  );

}