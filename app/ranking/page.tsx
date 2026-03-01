"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Ranking() {
  const [ranking, setRanking] = useState<
    { user: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("user_display_name");

      if (error) {
        console.error("Error:", error);
        return;
      }

      const counts: Record<string, number> = {};

      data?.forEach((row) => {
        const name = row.user_display_name || "Unknown";
        counts[name] = (counts[name] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .map(([user, count]) => ({ user, count }))
        .sort((a, b) => b.count - a.count);

      setRanking(sorted);
    };

    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        👑 Top Fans - BLINKCITY STATS
      </h1>

      <div className="max-w-2xl mx-auto space-y-4">
        {ranking.map((item, index) => (
          <div
            key={item.user}
            className="p-5 bg-zinc-800 rounded-xl flex justify-between items-center shadow-lg"
          >
            <span className="text-lg font-semibold">
              {index + 1}. {item.user}
            </span>
            <span className="text-pink-400 font-bold">
              🔥 {item.count} streams
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}