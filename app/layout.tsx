"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("blinkcity_user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      setUser(null);
    }
  }, [pathname]);

  const artists = [
    { id: "41MozSoPIsD1dJM0CLPjZF", name: "BLACKPINK" },
    { id: "250b0Wlc5Vk0CoUsaCY84M", name: "JENNIE" },
    { id: "6UZ0ba50XreR4TM8u322gs", name: "JISOO" },
    { id: "5L1lO4eRHmJ7a0Q6csE5cT", name: "LISA" },
    { id: "3eVa5w3URK5duf6eyVDbu9", name: "ROSÉ" },
  ];

  const showSidebar = user !== null;

  return (
    <html lang="en">
      <body className="bg-black text-white">

        {showSidebar && (
          <>
            {/* BOTÓN MENU */}
            <button
              onClick={() => setOpen(!open)}
              className="fixed top-6 left-6 z-50 text-3xl bg-zinc-900 p-3 rounded-lg shadow-lg"
            >
              ☰
            </button>

            {/* FONDO OSCURO CUANDO ABRE */}
            {open && (
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setOpen(false)}
              />
            )}

            {/* SIDEBAR */}
            <div
              className={`fixed top-0 left-0 h-full w-72 bg-zinc-900 p-6 shadow-2xl z-50 transform transition-transform duration-300 ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <h2 className="text-2xl font-bold mt-16 mb-8">
                BLINKCITY STATS
              </h2>

              <nav className="flex flex-col space-y-4 text-lg">

                <Link href="/profile" onClick={() => setOpen(false)}>
                  👤 Mi Perfil
                </Link>

                <Link href="/" onClick={() => setOpen(false)}>
                  📊 Dashboard
                </Link>

                <div className="border-t border-zinc-700 pt-6 mt-6">
                  <p className="mb-4 font-semibold text-zinc-400">
                    Artistas
                  </p>

                  <div className="flex flex-col space-y-3">
                    {artists.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/artist/${artist.id}`}
                        onClick={() => setOpen(false)}
                      >
                        {artist.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className={showSidebar ? "pt-24 px-8" : ""}>
          {children}
        </main>

      </body>
    </html>
  );
}