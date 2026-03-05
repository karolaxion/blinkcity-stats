"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const saveUsername = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    setLoading(true);
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ username: username.toLowerCase().trim() })
      .eq("id", user.id);

    if (dbError) {
      setError("Este username ya existe o es inválido.");
      setLoading(false);
    } else {
      router.push("/profile"); // Te manda directo al perfil
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 bg-zinc-900 rounded-xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Crea tu Username único</h1>
        <input 
          className="w-full p-3 bg-zinc-800 rounded border border-zinc-700"
          placeholder="Tu nombre de usuario..."
          onChange={(e) => setUsername(e.target.value)}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button 
          onClick={saveUsername}
          disabled={loading}
          className="w-full bg-pink-600 py-3 rounded font-bold"
        >
          {loading ? "Guardando..." : "Empezar"}
        </button>
      </div>
    </div>
  );
}
