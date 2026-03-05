import "./globals.css";

export const metadata = {
  title: "Blinkcity Stats",
  description: "Estadísticas de streaming para fans de BLACKPINK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen text-white"
        style={{
          margin: 0,
          background:
            "radial-gradient(circle at top, #ff2d95 0%, #0a0a0a 40%, #000000 80%)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}