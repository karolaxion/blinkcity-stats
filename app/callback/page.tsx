"use client";

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

    console.log("Spotify code:", code);

    // aquí luego procesaremos el login
    router.push("/profile");

  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Conectando con Spotify...
    </div>
  );

}