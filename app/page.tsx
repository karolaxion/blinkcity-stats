"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {

  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-8">

      <h1 className="text-4xl font-bold">
        BLINKCITY STATS 💗
      </h1>

      <button
        onClick={() => router.push("/api/spotify/login")}
        className="bg-green-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600"
      >
        Conectar con Spotify
      </button>

      <button
        onClick={() => router.push("/api/lastfm/link")}
        className="bg-red-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-700"
      >
        Conectar con Last.fm
      </button>

    </div>
  );
}