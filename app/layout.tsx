"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const showSidebar = pathname !== "/";

  return (
    <html lang="en">
      <body className="bg-black text-white">

        {showSidebar && <Sidebar />}

        {children}

      </body>
    </html>
  );
}