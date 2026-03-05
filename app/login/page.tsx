"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, lastfm_username")
      .eq("id", user.id)
      .single();

    // 🔥 Verificación completa
    if (!profile?.username || !profile?.lastfm_username) {
      router.push("/setup");
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-6">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Iniciar Sesión
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-zinc-800 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 mb-4 bg-zinc-800 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && (
          <p className="text-red-500 mb-4 text-sm">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 py-3 rounded-lg font-bold hover:bg-green-700"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-sm text-center mt-6 text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-pink-500 hover:underline">
            Registrarse
          </Link>
        </p>

      </div>
    </div>
  );
}