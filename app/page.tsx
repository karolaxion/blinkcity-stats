"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {

  const router = useRouter();

  const connectSpotify = () => {

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

    const redirectUri =
      "https://blinkcity-stats.vercel.app/api/spotify/callback";

    const scope = "user-read-recently-played";

    const url =
      "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId!,
        scope,
        redirect_uri: redirectUri,
      }).toString();

    console.log("Spotify URL:", url);

    window.location.href = url;

  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-6 text-center px-6">

      <h1 className="text-4xl md:text-5xl font-bold">
        BLINKCITY STATS 💗
      </h1>

      <p className="text-lg text-zinc-300">
        Bienvenidos a Blinkcity Stats
      </p>

      <p className="text-sm text-zinc-400 max-w-md">
        Esta aún es una versión demo. Algunas funciones pueden cambiar o mejorar en el futuro.
      </p>

      <div className="flex flex-col gap-4 mt-4">

        {/* BOTON SPOTIFY */}

        <button
          onClick={connectSpotify}
          className="bg-green-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600"
        >
          Conectar con Spotify
        </button>

        {/* BOTON LASTFM */}

        <button
          onClick={() => router.push("/api/lastfm/link")}
          className="bg-red-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-700"
        >
          Conectar con Last.fm
        </button>

      </div>

    </div>
  );
}