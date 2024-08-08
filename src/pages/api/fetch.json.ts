import type { APIRoute } from 'astro';
import { formatISO } from 'date-fns';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const stockInput = url.searchParams.get('stock');
  const range = url.searchParams.get('range');

  if (!stockInput || !range) {
    return new Response(JSON.stringify({ error: 'Stock and range parameters are required' }), { status: 400 });
  }

  const today = new Date();
  const endDate = formatISO(today, { representation: 'date' });
  let startDate: string;

  switch (range) {
    case '1W':
      startDate = formatISO(new Date(today.setDate(today.getDate() - 7)), { representation: 'date' });
      break;
    case '1M':
      startDate = formatISO(new Date(today.setMonth(today.getMonth() - 1)), { representation: 'date' });
      break;
    case '1Y':
      startDate = formatISO(new Date(today.setFullYear(today.getFullYear() - 1)), { representation: 'date' });
      break;
    case 'ALL':
    default:
      startDate = formatISO(new Date(today.setFullYear(today.getFullYear() - 5)), { representation: 'date' });
      break;
  }

  const apiKey = import.meta.env.POLYGON_API_KEY;
  const searchUrl = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(stockInput)}&active=true&sort=ticker&order=asc&apiKey=${apiKey}`;

  try {
    // Search for the stock ticker based on the input name
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      return new Response(JSON.stringify({ error: 'Stock not found' }), { status: 404 });
    }

    const searchResults = await searchResponse.json();
    if (!searchResults.results || searchResults.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Stock not found' }), { status: 404 });
    }

    const stockTicker = searchResults.results[0].ticker;
    const stockName = searchResults.results[0].name;

    const stockDataUrl = `https://api.polygon.io/v2/aggs/ticker/${stockTicker}/range/1/day/${startDate}/${endDate}?apiKey=${apiKey}`;
    const stockFinancialsUrl = `https://api.polygon.io/v2/reference/financials/${stockTicker}?limit=1&apiKey=${apiKey}`;

    const [stockDataResponse, stockFinancialsResponse] = await Promise.all([
      fetch(stockDataUrl),
      fetch(stockFinancialsUrl)
    ]);

    if (!stockDataResponse.ok || !stockFinancialsResponse.ok) {
      throw new Error('Error fetching data from Polygon.io');
    }

    const stockData = await stockDataResponse.json();
    const stockFinancials = await stockFinancialsResponse.json();

    if (stockData.results && stockFinancials.results.length > 0) {
      const prices = stockData.results.map((result: any) => result.c);
      const dates = stockData.results.map((result: any) => new Date(result.t).toISOString());
      const marketCap = stockFinancials.results[0].marketCapitalization;
      const revenue = stockFinancials.results[0].revenue;

      return new Response(JSON.stringify({ prices, dates, stock: stockName, marketCap, revenue }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'No data found' }), { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
