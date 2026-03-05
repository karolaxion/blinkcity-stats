export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="text-white min-h-screen"
        style={{
          background:
            "linear-gradient(180deg, #000000 0%, #111111 100%)",
        }}
      >
        {children}
      </body>
    </html>
  );
}