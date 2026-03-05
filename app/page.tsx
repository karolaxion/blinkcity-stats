"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [dataByArtist, setDataByArtist] = useState<any>({});

  const ARTISTS = [
    { id: "41MozSoPIsD1dJM0CLPjZF", name: "BLACKPINK" },
    { id: "250b0Wlc5Vk0CoUsaCY84M", name: "JENNIE" },
    { id: "6UZ0ba50XreR4TM8u322gs", name: "JISOO" },
    { id: "5L1lO4eRHmJ7a0Q6csE5cT", name: "LISA" },
    { id: "3eVa5w3URK5duf6eyVDbu9", name: "ROSÉ" },
  ];

  // 🔐 Revisar sesión REAL de Supabase
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, []);

  // 📊 Cargar datos cuando hay usuario autenticado
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

  if (!user) return null;

  return (
    <div className="min-h-screen text-white p-5 md:p-10">

      <h1 className="text-2xl md:text-3xl font-bold mb-10 text-center md:text-left">
        Bienvenida {user.username} 💗
      </h1>

      <div className="space-y-16">
        {Object.entries(dataByArtist).map(
          ([artistId, artistData]: any) => (
            <div key={artistId}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                {artistData.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

                {/* 🎵 TOP 5 CANCIONES */}
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-4">
                    🎵 Top 5 Canciones
                  </h3>

                  {artistData.topSongs.map(
                    (item: any, index: number) => (
                      <div
                        key={item.song}
                        className="bg-zinc-800 p-3 md:p-4 rounded-lg mb-2 flex justify-between text-sm md:text-base"
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
                  <h3 className="text-lg md:text-xl font-semibold mb-4">
                    👑 Top 5 Fans
                  </h3>

                  {artistData.topUsers.map(
                    (item: any, index: number) => (
                      <div
                        key={item.user}
                        className="bg-zinc-800 p-3 md:p-4 rounded-lg mb-2 flex justify-between text-sm md:text-base"
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
    </div>
  );
}