import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  console.log('API endpoint hit'); // Ensure endpoint is hit

  // Log the request method and URL for debugging
  console.log('Request method:', request.method);
  console.log('Full URL:', request.url); // Log full URL

  // Parse the URL to extract the query parameters
  const url = new URL(request.url, `http://${request.headers.get('host')}`);
  console.log('Query parameters:', url.searchParams.toString()); // Log query parameters

  // Extracting the stock parameter
  const stock = url.searchParams.get('stock');
  console.log('Extracted stock parameter:', stock); // Log the extracted stock parameter

  if (!stock) {
    console.log('No stock parameter');
    return new Response(JSON.stringify({ error: 'Stock parameter is required' }), { status: 400 });
  }

  // For now, simply return the stock parameter as the response
  return new Response(JSON.stringify({ stock }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
