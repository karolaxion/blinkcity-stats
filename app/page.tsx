export default function Home() {

  const lastfmAuthUrl =
    `https://www.last.fm/api/auth/?api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}`

  return (

    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg,#000,#1a1a1a)",
        color: "white",
        textAlign: "center"
      }}
    >

      <div>

        <h1
          style={{
            fontSize: "56px",
            color: "#ff2e93",
            marginBottom: "10px"
          }}
        >
          BlinkCity
        </h1>

        <p
          style={{
            fontSize: "18px",
            opacity: 0.7,
            marginBottom: "40px"
          }}
        >
          Track BLACKPINK streams  
          and this is a beta and test version
        </p>

        <a
          href={lastfmAuthUrl}
          style={{
            background: "#ff2e93",
            padding: "16px 40px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "18px",
            boxShadow: "0 5px 20px rgba(255,46,147,0.5)"
          }}
        >
          Connect with Last.fm
        </a>

      </div>

    </main>

  )
}