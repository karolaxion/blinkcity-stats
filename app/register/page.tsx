"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("Error creando usuario");
      setLoading(false);
      return;
    }

    // Crear perfil vacío (username null)
    await supabase.from("profiles").insert({
      id: data.user.id,
      username: null,
    });

    router.push("/setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-6">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Crear Cuenta
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
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-pink-600 py-3 rounded-lg font-bold hover:bg-pink-700"
        >
          {loading ? "Creando..." : "Registrarse"}
        </button>

        <p className="text-sm text-center mt-6 text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-pink-500 hover:underline">
            Iniciar sesión
          </Link>
        </p>

      </div>
    </div>
  );
}