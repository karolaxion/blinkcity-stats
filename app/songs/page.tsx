"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SongRanking() {
  const [ranking, setRanking] = useState<
    { song: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchSongRanking = async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("track_name");

      if (error) {
        console.error("Error:", error);
        return;
      }

      const counts: Record<string, number> = {};

      data?.forEach((row) => {
        counts[row.track_name] =
          (counts[row.track_name] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .map(([song, count]) => ({ song, count }))
        .sort((a, b) => b.count - a.count);

      setRanking(sorted);
    };

    fetchSongRanking();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        🎵 Ranking por Canción - BLINKCITY STATS
      </h1>

      <div className="max-w-2xl mx-auto space-y-4">
        {ranking.map((item, index) => (
          <div
            key={item.song}
            className="p-5 bg-zinc-800 rounded-xl flex justify-between items-center shadow-lg"
          >
            <span className="text-lg font-semibold">
              {index + 1}. {item.song}
            </span>
            <span className="text-yellow-400 font-bold">
              🔥 {item.count} streams
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}