import { type NextRequest, NextResponse } from "next/server"

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) {
    return true
  }

  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4Match) return false

  const a = Number(ipv4Match[1])
  const b = Number(ipv4Match[2])
  if (a > 255 || b > 255) return true

  return a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || a === 127
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url")
  if (!target) {
    return NextResponse.json({ error: "Missing url query parameter" }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 })
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Unsupported url protocol" }, { status: 400 })
  }

  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "Blocked host" }, { status: 400 })
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      method: "GET",
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
      cache: "force-cache",
      next: { revalidate: 3600 },
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream error: ${upstream.status}` }, { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream"
    const arrayBuffer = await upstream.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("[v0] image-proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}
