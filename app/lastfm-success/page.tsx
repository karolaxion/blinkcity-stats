"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LastfmSuccessPage() {

  const router = useRouter();

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (!username) {
      router.push("/profile");
      return;
    }

    router.push("/profile");

  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      Conexión con Last.fm completada...
    </div>
  );

}