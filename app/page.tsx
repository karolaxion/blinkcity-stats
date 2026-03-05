"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="text-center max-w-xl">

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-pink-500 tracking-wide">
          BLINKCITY STATS
        </h1>

        <p className="text-lg md:text-xl text-gray-200 mb-3">
          Bienvenidos a Blinkcity Stats
        </p>

        <p className="text-gray-400 mb-10">
          Esta es una versión demo donde puedes ver tus estadísticas de
          reproducción conectando tu cuenta de Spotify o Last.fm.
        </p>

        <div className="flex flex-col gap-4">

          <button
            onClick={() => router.push("/api/spotify/login")}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl text-lg transition"
          >
            Conectar con Spotify
          </button>

          <button
            onClick={() => router.push("/api/lastfm/link")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition"
          >
            Conectar con Last.fm
          </button>

        </div>

      </div>

    </div>
  );
}