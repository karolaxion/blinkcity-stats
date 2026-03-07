"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {

    const code = searchParams.get("code");

    if (!code) {
      router.replace("/");
      return;
    }

    console.log("Spotify code:", code);

    router.replace("/profile");

  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Conectando con Spotify...
    </div>
  );
}