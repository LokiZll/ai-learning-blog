import type { APIRoute } from 'astro';

// GET handler for logout (works around CSRF)
export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/'
    }
  });
};

// POST handler
export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
