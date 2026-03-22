"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const isHome = pathname === "/"

  const [open,setOpen] = useState(false)

  function closeMenu(){
    setOpen(false)
  }

  return (
    <html>
      <body
        style={{
          margin:0,
          fontFamily:"Arial",
          background:"#0f0f0f",
          color:"white"
        }}
      >

        {/* TOP BAR SOLO SI NO ES HOME */}

        {!isHome && (

          <div
            style={{
              display:"flex",
              alignItems:"center",
              padding:"15px 20px",
              background:"#000",
              borderBottom:"1px solid #222"
            }}
          >

            <button
              onClick={()=>setOpen(!open)}
              style={{
                fontSize:"22px",
                background:"none",
                border:"none",
                color:"white",
                cursor:"pointer"
              }}
            >
              ☰
            </button>

            <h2
              style={{
                marginLeft:"15px",
                color:"#ff2e93"
              }}
            >
              BlinkCity
            </h2>

          </div>

        )}

        {/* SIDEBAR */}

        {!isHome && open && (

          <div
            style={{
              position:"fixed",
              top:0,
              left:0,
              width:"240px",
              height:"100%",
              background:"#000",
              padding:"30px 20px",
              borderRight:"1px solid #222",
              zIndex:100
            }}
          >

            <nav
              style={{
                display:"flex",
                flexDirection:"column",
                gap:"18px"
              }}
            >

              <Link href="/profile" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                Profile
              </Link>

              <Link href="/ranking" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                Ranking
              </Link>

              <div style={{marginTop:"20px",opacity:0.6}}>
                Artists
              </div>

              <Link href="/artist/blackpink" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                BLACKPINK
              </Link>

              <Link href="/artist/jennie" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                JENNIE
              </Link>

              <Link href="/artist/rose" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                ROSÉ
              </Link>

              <Link href="/artist/jisoo" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                JISOO
              </Link>

              <Link href="/artist/lisa" onClick={closeMenu} style={{color:"white",textDecoration:"none"}}>
                LISA
              </Link>

            </nav>

          </div>

        )}

        <main>
          {children}
        </main>

      </body>
    </html>
  )
}