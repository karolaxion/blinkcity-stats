"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [dataByArtist, setDataByArtist] = useState<any>({});

  const ARTISTS = [
    { id: "41MozSoPIsD1dJM0CLPjZF", name: "BLACKPINK" },
    { id: "250b0Wlc5Vk0CoUsaCY84M", name: "JENNIE" },
    { id: "6UZ0ba50XreR4TM8u322gs", name: "JISOO" },
    { id: "5L1lO4eRHmJ7a0Q6csE5cT", name: "LISA" },
    { id: "3eVa5w3URK5duf6eyVDbu9", name: "ROSÉ" },
  ];

  // 🔐 Revisar si hay sesión guardada
  useEffect(() => {
    const stored = localStorage.getItem("blinkcity_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // 📊 Cargar datos cuando hay usuario
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const result: any = {};

      for (const artist of ARTISTS) {
        const { data } = await supabase
          .from("streams")
          .select("track_name, user_display_name")
          .eq("artist_id", artist.id);

        if (!data) continue;

        const songCounts: Record<string, number> = {};
        const userCounts: Record<string, number> = {};

        data.forEach((row) => {
          songCounts[row.track_name] =
            (songCounts[row.track_name] || 0) + 1;

          userCounts[row.user_display_name] =
            (userCounts[row.user_display_name] || 0) + 1;
        });

        result[artist.id] = {
          name: artist.name,
          topSongs: Object.entries(songCounts)
            .map(([song, count]) => ({ song, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          topUsers: Object.entries(userCounts)
            .map(([user, count]) => ({ user, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        };
      }

      setDataByArtist(result);
    };

    fetchData();
  }, [user]);

  // 🔑 LOGIN SPOTIFY
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = window.location.origin + "/callback";
    const scope = "user-read-recently-played";

    const authUrl =
      "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId!,
        scope: scope,
        redirect_uri: redirectUri,
      }).toString();

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen text-white p-10">

      {/* 🟢 SI NO HAY USUARIO → MOSTRAR LOGIN */}
      {!user && (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
          <h1 className="text-4xl font-bold">
            BLINKCITY STATS 💗
          </h1>

          <button
            onClick={handleLogin}
            className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Login with Spotify
          </button>
        </div>
      )}

      {/* 🔵 SI HAY USUARIO → MOSTRAR DASHBOARD */}
      {user && (
        <>
          <h1 className="text-3xl font-bold mb-10">
            Bienvenida {user.name} 💗
          </h1>

          <div className="space-y-16">
            {Object.entries(dataByArtist).map(
              ([artistId, artistData]: any) => (
                <div key={artistId}>
                  <h2 className="text-3xl font-bold mb-6">
                    {artistData.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-10">

                    {/* 🎵 TOP 5 CANCIONES */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        🎵 Top 5 Canciones
                      </h3>

                      {artistData.topSongs.map(
                        (item: any, index: number) => (
                          <div
                            key={item.song}
                            className="bg-zinc-800 p-3 rounded-lg mb-2 flex justify-between"
                          >
                            <span>
                              {index + 1}. {item.song}
                            </span>
                            <span className="text-yellow-400">
                              🔥 {item.count}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* 👑 TOP 5 FANS */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        👑 Top 5 Fans
                      </h3>

                      {artistData.topUsers.map(
                        (item: any, index: number) => (
                          <div
                            key={item.user}
                            className="bg-zinc-800 p-3 rounded-lg mb-2 flex justify-between"
                          >
                            <span>
                              {index + 1}. {item.user}
                            </span>
                            <span className="text-pink-400">
                              🎧 {item.count}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}

    </div>
  );
}