import type { APIRoute } from 'astro';
import axios from 'axios';
import { config } from 'dotenv';
import { subDays, subWeeks, subMonths, subYears } from 'date-fns';

config(); // Load environment variables from .env

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

const getStartDate = (range: string): Date => {
  const now = new Date();
  switch (range) {
    case '1D':
      return subDays(now, 1);
    case '1W':
      return subWeeks(now, 1);
    case '1M':
      return subMonths(now, 1);
    case '1Y':
      return subYears(now, 1);
    case 'ALL':
      return new Date(2000, 0, 1); // Example start date for all data
    default:
      return subDays(now, 1);
  }
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url, `http://localhost`); // Using a dummy host for URL parsing

  // Extracting the stock and range parameters
  const stock = url.searchParams.get('stock');
  const range = url.searchParams.get('range') || '1D';

  if (!stock) {
    return new Response(JSON.stringify({ error: 'Stock parameter is required' }), { status: 400 });
  }

  const startDate = getStartDate(range).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  try {
    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${startDate}/${endDate}`, {
      params: {
        apiKey: POLYGON_API_KEY
      }
    });

    const data = response.data;

    if (!data.results || data.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid stock symbol or no data available' }), { status: 400 });
    }

    const prices = data.results.map((entry: any) => entry.c); // Close prices
    const dates = data.results.map((entry: any) => new Date(entry.t).toISOString().split('T')[0]); // Date

    return new Response(JSON.stringify({ stock, prices, dates }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
  }
};
