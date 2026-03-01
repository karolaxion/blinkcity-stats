"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ArtistPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const ARTISTS: Record<string, string> = {
    "41MozSoPIsD1dJM0CLPjZF": "BLACKPINK",
    "250b0Wlc5Vk0CoUsaCY84M": "JENNIE",
    "6UZ0ba50XreR4TM8u322gs": "JISOO",
    "5L1lO4eRHmJ7a0Q6csE5cT": "LISA",
    "3eVa5w3URK5duf6eyVDbu9": "ROSÉ",
  };

  const artistName = ARTISTS[artistId] || "Artista desconocido";

  const [songPeriod, setSongPeriod] = useState("historical");
  const [userPeriod, setUserPeriod] = useState("historical");

  const [totalStreams, setTotalStreams] = useState(0);
  const [monthlyStreams, setMonthlyStreams] = useState(0);
  const [dailyStreams, setDailyStreams] = useState(0);

  const [topSongs, setTopSongs] = useState<{ song: string; count: number }[]>([]);
  const [topUsers, setTopUsers] = useState<{ user: string; count: number }[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count: total } = await supabase
        .from("streams")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", artistId);

      const { count: monthly } = await supabase
        .from("streams")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", artistId)
        .gte("played_at", monthStart);

      const { count: daily } = await supabase
        .from("streams")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", artistId)
        .gte("played_at", today);

      setTotalStreams(total || 0);
      setMonthlyStreams(monthly || 0);
      setDailyStreams(daily || 0);
    };

    fetchMetrics();
  }, [artistId]);

  useEffect(() => {
    const fetchTopSongs = async () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      let query = supabase
        .from("streams")
        .select("track_name")
        .eq("artist_id", artistId);

      if (songPeriod === "monthly") query = query.gte("played_at", monthStart);
      if (songPeriod === "daily") query = query.gte("played_at", today);

      const { data } = await query;
      if (!data) return;

      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.track_name] = (counts[row.track_name] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .map(([song, count]) => ({ song, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      setTopSongs(sorted);
    };

    fetchTopSongs();
  }, [artistId, songPeriod]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      let query = supabase
        .from("streams")
        .select("user_display_name")
        .eq("artist_id", artistId);

      if (userPeriod === "monthly") query = query.gte("played_at", monthStart);
      if (userPeriod === "daily") query = query.gte("played_at", today);

      const { data } = await query;
      if (!data) return;

      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.user_display_name] =
          (counts[row.user_display_name] || 0) + 1;
      });

      const sorted = Object.entries(counts)
        .map(([user, count]) => ({ user, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 100);

      setTopUsers(sorted);
    };

    fetchTopUsers();
  }, [artistId, userPeriod]);

  const renderMedal = (index: number) => {
    if (index === 0) return "🥇 ";
    if (index === 1) return "🥈 ";
    if (index === 2) return "🥉 ";
    return "";
  };

  return (
    <div className="min-h-screen text-white px-5 md:pl-24 md:pr-10 pt-20">

      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">
        {artistName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard title="🎧 Histórico" value={totalStreams} />
        <MetricCard title="📅 Mensual" value={monthlyStreams} />
        <MetricCard title="🕒 Diario" value={dailyStreams} />
      </div>

      <Section
        title="🎵 Top 20 Canciones"
        period={songPeriod}
        setPeriod={setSongPeriod}
      >
        {topSongs.map((item, index) => (
          <Row
            key={item.song}
            left={`${renderMedal(index)}${index + 1}. ${item.song}`}
            right={`🔥 ${item.count}`}
          />
        ))}
      </Section>

      <Section
        title="👑 Top 100 Fans"
        period={userPeriod}
        setPeriod={setUserPeriod}
      >
        {topUsers.map((item, index) => (
          <Row
            key={item.user}
            left={`${renderMedal(index)}${index + 1}. ${item.user}`}
            right={`🎧 ${item.count}`}
          />
        ))}
      </Section>
    </div>
  );
}

function MetricCard({ title, value }: any) {
  return (
    <div className="bg-zinc-800 p-4 md:p-6 rounded-xl text-center">
      <p className="text-sm md:text-base">{title}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}

function Section({ title, period, setPeriod, children }: any) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-zinc-800 p-2 rounded-lg text-sm md:text-base"
        >
          <option value="historical">Histórico</option>
          <option value="monthly">Mensual</option>
          <option value="daily">Diario</option>
        </select>
      </div>

      <div className="space-y-3 mb-12">{children}</div>
    </>
  );
}

function Row({ left, right }: any) {
  return (
    <div className="bg-zinc-800 p-3 md:p-4 rounded-lg flex justify-between text-sm md:text-base">
      <span>{left}</span>
      <span className="font-bold">{right}</span>
    </div>
  );
}