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
      router.replace("/");
      return;
    }

    console.log("Spotify code:", code);

    router.replace("/profile");

  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Conectando con Spotify...
    </div>
  );
}