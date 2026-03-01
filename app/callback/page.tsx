"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      router.push("/");
      return;
    }

    const fetchToken = async () => {
      const res = await fetch("/api/spotify/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.user) {
        localStorage.setItem(
          "blinkcity_user",
          JSON.stringify(data.user)
        );
      }

      router.push("/");
    };

    fetchToken();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Procesando inicio de sesión...
    </div>
  );
}