/**
 * Next.js API proxy for the Nitter scraper backend.
 *
 * All requests to /api/scraper/* are forwarded to the Python FastAPI backend.
 * This avoids CORS issues and keeps the backend URL server-side only.
 *
 * Backend URL is configured via SCRAPER_BACKEND_URL env var.
 * Default: http://localhost:8000
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.SCRAPER_BACKEND_URL ?? "http://localhost:8000";

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params;
  const pathStr = path.join("/");

  // Forward query string
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/${pathStr}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const body = req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      // 30s timeout for scan requests
      signal: AbortSignal.timeout(30_000),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Backend not running
    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return NextResponse.json(
        {
          error: "Scraper backend is not running",
          detail: "Start the Python backend: cd backend && python run.py",
          backend_url: BACKEND_URL,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Proxy error", detail: message },
      { status: 500 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
