/**
 * Cloudflare Pages Function — API proxy
 *
 * All requests to /api/* are forwarded to the Node.js backend
 * (Render, Fly.io, or any other host).
 *
 * Set the environment variable BACKEND_URL in the Cloudflare Pages dashboard
 * to the full URL of the backend, e.g. https://stampbook.onrender.com
 *
 * If BACKEND_URL is not set, returns a 503 with a helpful message.
 */
export async function onRequest(context) {
  const { request, env } = context;

  const backendUrl = env.BACKEND_URL;
  if (!backendUrl) {
    return new Response(
      JSON.stringify({
        error: "Backend not configured",
        hint:  "Set the BACKEND_URL environment variable in Cloudflare Pages settings"
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Build the upstream URL
  const url      = new URL(request.url);
  const upstream = new URL(url.pathname + url.search, backendUrl);

  // Forward the request, passing all headers
  const init = {
    method:  request.method,
    headers: Object.fromEntries(request.headers),
    body:    ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "follow"
  };

  try {
    const response = await fetch(upstream.toString(), init);
    const body     = await response.arrayBuffer();

    return new Response(body, {
      status:  response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-sync-token"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream error", details: err.message }),
      {
        status:  502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
