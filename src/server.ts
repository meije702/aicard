// Entry point for the compiled AICard binary.
// Serves the bundled React app from the embedded dist/ directory.
//
// Usage:
//   deno task build    → builds the frontend and compiles this into ./aicard
//   ./aicard           → starts the server and opens the browser

const PORT = 3000

// Locate dist/ relative to this file. Works both when running from source
// (import.meta.dirname points to src/) and when embedded in a compiled binary.
const DIST = new URL("../dist/", import.meta.url).pathname

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
  ".json": "application/json",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
}

function contentType(path: string): string {
  const ext = path.match(/\.[^.]+$/)?.[0] ?? ""
  return CONTENT_TYPES[ext] ?? "application/octet-stream"
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname
  const filePath = DIST + pathname.slice(1)

  try {
    const file = await Deno.readFile(filePath)
    return new Response(file, {
      headers: { "content-type": contentType(filePath) },
    })
  } catch {
    // SPA fallback: serve index.html for any path the app handles client-side
    const index = await Deno.readFile(DIST + "index.html")
    return new Response(index, {
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  }
}

console.log(`AICard is running at http://localhost:${PORT}`)
console.log("Press Ctrl+C to stop.\n")

// Open the browser (macOS / Linux / Windows)
const opener =
  Deno.build.os === "windows" ? "cmd" :
  Deno.build.os === "darwin"  ? "open" : "xdg-open"
const args =
  Deno.build.os === "windows"
    ? ["/c", "start", `http://localhost:${PORT}`]
    : [`http://localhost:${PORT}`]

try {
  new Deno.Command(opener, { args }).spawn()
} catch {
  // If the browser can't be opened automatically, the URL is already printed above
}

Deno.serve({ port: PORT }, handler)
