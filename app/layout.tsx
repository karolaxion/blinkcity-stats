export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background:
            "radial-gradient(circle at top, #1a1a1a 0%, #000000 60%)",
          color: "white",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}