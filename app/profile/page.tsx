"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("blinkcity_user");
    if (!stored) {
      router.push("/");
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);

    const fetchUserStats = async () => {
      const { data } = await supabase
        .from("streams")
        .select("track_name, artist_name")
        .eq("user_id", parsed.id);

      if (!data) return;

      const songCounts: Record<string, number> = {};
      const artistCounts: Record<string, number> = {};

      data.forEach((row) => {
        const songKey = `${row.track_name}|||${row.artist_name}`;

        songCounts[songKey] =
          (songCounts[songKey] || 0) + 1;

        artistCounts[row.artist_name] =
          (artistCounts[row.artist_name] || 0) + 1;
      });

      const sortedSongs = Object.entries(songCounts)
        .map(([key, count]) => {
          const [song, artist] = key.split("|||");
          return { song, artist, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // 🔥 Top 10 ahora

      const sortedArtists = Object.entries(artistCounts)
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopSongs(sortedSongs);
      setTopArtists(sortedArtists);
    };

    fetchUserStats();
  }, []);

  const logout = () => {
    localStorage.removeItem("blinkcity_user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-5 md:p-10">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6 md:gap-0 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold">
          Perfil de {user.name} 💗
        </h1>

        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12">

        {/* 🔥 TOP 10 CANCIONES */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            🎵 Tus Top 10 Canciones
          </h2>

          {topSongs.map((item, index) => (
            <div
              key={`${item.song}-${item.artist}`}
              className="bg-zinc-800 p-3 md:p-4 rounded-lg mb-2 flex justify-between text-sm md:text-base"
            >
              <div>
                <div>
                  {index + 1}. {item.song}
                </div>
                <div className="text-zinc-400 text-xs md:text-sm">
                  {item.artist}
                </div>
              </div>

              <span className="font-bold">
                🔥 {item.count}
              </span>
            </div>
          ))}
        </div>

        {/* 👩‍🎤 TOP 5 ARTISTAS */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            👩‍🎤 Tus Top 5 Artistas
          </h2>

          {topArtists.map((item, index) => (
            <div
              key={item.artist}
              className="bg-zinc-800 p-3 md:p-4 rounded-lg mb-2 flex justify-between text-sm md:text-base"
            >
              <span>
                {index + 1}. {item.artist}
              </span>
              <span className="font-bold">
                🎧 {item.count}
              </span>
            </div>
          ))}
        </div>

      </div>

      <div className="text-center md:text-left">
        <button
          onClick={() => router.push("/")}
          className="bg-pink-600 px-6 py-3 rounded-lg font-bold"
        >
          Ir al Dashboard
        </button>
      </div>

    </div>
  );
}