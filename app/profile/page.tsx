"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);

  const router = useRouter();

  async function autoSyncLastFM(userId: string, lastfmUsername: string) {

    try {

      const res = await fetch(`/api/lastfm/recent?username=${lastfmUsername}`);
      const data = await res.json();

      if (!data?.recenttracks?.track) return;

      const tracks = data.recenttracks.track;

      for (const track of tracks) {

        const artist = track.artist["#text"];
        const song = track.name;

        if (!track.date) continue;

        const playedAt = new Date(
          parseInt(track.date.uts) * 1000
        ).toISOString();

        await supabase.from("streams").insert({
          internal_user_id: userId,
          user_id: lastfmUsername,
          user_display_name: lastfmUsername,
          artist_name: artist,
          track_name: song,
          played_at: playedAt,
          source: "lastfm"
        });

      }

    } catch (err) {
      console.log("LastFM sync error", err);
    }

  }

  useEffect(() => {

    const loadUser = async () => {

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, lastfm_username, spotify_id")
        .eq("id", authData.user.id)
        .single();

      const username = profile?.username || "Usuario";

      setUser({
        id: authData.user.id,
        name: username
      });

      setProfileData(profile);

      if (profile?.lastfm_username) {
        await autoSyncLastFM(authData.user.id, profile.lastfm_username);
      }

      const { data: streams } = await supabase
        .from("streams")
        .select("track_name, artist_name")
        .eq("internal_user_id", authData.user.id);

      if (!streams) return;

      const songCounts: Record<string, number> = {};
      const artistCounts: Record<string, number> = {};

      streams.forEach((row) => {

        const key = `${row.track_name}|||${row.artist_name}`;

        songCounts[key] = (songCounts[key] || 0) + 1;
        artistCounts[row.artist_name] =
          (artistCounts[row.artist_name] || 0) + 1;

      });

      const sortedSongs = Object.entries(songCounts)
        .map(([key, count]) => {

          const [song, artist] = key.split("|||");

          return { song, artist, count };

        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const sortedArtists = Object.entries(artistCounts)
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopSongs(sortedSongs);
      setTopArtists(sortedArtists);

    };

    loadUser();

  }, []);

  const logout = async () => {

    await supabase.auth.signOut();
    router.push("/login");

  };

  const disconnectLastFM = async () => {

    if (!user) return;

    await supabase
      .from("profiles")
      .update({ lastfm_username: null })
      .eq("id", user.id);

    setProfileData({
      ...profileData,
      lastfm_username: null
    });

  };

  const disconnectSpotify = async () => {

    if (!user) return;

    await supabase
      .from("profiles")
      .update({ spotify_id: null })
      .eq("id", user.id);

    setProfileData({
      ...profileData,
      spotify_id: null
    });

  };

  if (!user) return null;

  return (

    <div className="min-h-screen text-white p-5 md:p-10">

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">

        <h1 className="text-2xl md:text-3xl font-bold">
          Perfil de {user.name} 💗
        </h1>

        <button
          onClick={() => router.push("/")}
          className="bg-pink-600 px-5 py-2 rounded-lg font-semibold hover:bg-pink-700"
        >
          Ir al Dashboard
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

        <div>

          <h2 className="text-lg md:text-xl font-semibold mb-4">
            🎵 Tus Top 10 Canciones
          </h2>

          {topSongs.map((item, index) => (

            <div
              key={`${item.song}-${index}`}
              className="bg-zinc-800 p-3 md:p-4 rounded-lg mb-2 flex justify-between"
            >

              <div>

                <p>{index + 1}. {item.song}</p>
                <p className="text-xs text-zinc-400">{item.artist}</p>

              </div>

              <span>🔥 {item.count}</span>

            </div>

          ))}

        </div>

        <div>

          <h2 className="text-lg md:text-xl font-semibold mb-4">
            👑 Tus Top 5 Artistas
          </h2>

          {topArtists.map((item, index) => (

            <div
              key={`${item.artist}-${index}`}
              className="bg-zinc-800 p-3 md:p-4 rounded-lg mb-2 flex justify-between"
            >

              <span>{index + 1}. {item.artist}</span>
              <span>🎧 {item.count}</span>

            </div>

          ))}

        </div>

      </div>

      <div className="border-t border-zinc-700 pt-10 mt-10">

        <h2 className="text-xl font-bold mb-6">
          Conexiones
        </h2>

        <div className="flex flex-col gap-4">

          <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg">

            <span>Last.fm</span>

            {profileData?.lastfm_username ? (

              <div className="flex items-center gap-3">

                <span className="text-green-400">
                  Conectado ({profileData.lastfm_username})
                </span>

                <button
                  onClick={disconnectLastFM}
                  className="bg-zinc-700 px-3 py-1 rounded-lg"
                >
                  Desconectar
                </button>

              </div>

            ) : (

              <button
                onClick={() => {
                  window.location.href = "/api/lastfm/link";
                }}
                className="bg-red-600 px-4 py-2 rounded-lg"
              >
                Conectar Last.fm
              </button>

            )}

          </div>

          <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg">

            <span>Spotify</span>

            {profileData?.spotify_id ? (

              <div className="flex items-center gap-3">

                <span className="text-green-400">
                  Conectado
                </span>

                <button
                  onClick={disconnectSpotify}
                  className="bg-zinc-700 px-3 py-1 rounded-lg"
                >
                  Desconectar
                </button>

              </div>

            ) : (

              <button
                onClick={() => {
                  window.location.href = "/api/spotify/login";
                }}
                className="bg-green-600 px-4 py-2 rounded-lg"
              >
                Conectar Spotify
              </button>

            )}

          </div>

        </div>

        <button
          onClick={logout}
          className="mt-8 bg-red-600 px-6 py-3 rounded-lg"
        >
          Cerrar sesión
        </button>

      </div>

    </div>

  );

}