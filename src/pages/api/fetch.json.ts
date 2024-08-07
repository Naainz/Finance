import type { APIRoute } from 'astro';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config(); // Load environment variables from .env

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

interface FinnhubResponse {
  c: number; // Current price
  h: number; // High price
  l: number; // Low price
  o: number; // Open price
  pc: number; // Previous close price
  t: number; // Timestamp
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url, `http://localhost`); // Using a dummy host for URL parsing

  // Extracting the stock parameter
  const stock = url.searchParams.get('stock');

  if (!stock) {
    return new Response(JSON.stringify({ error: 'Stock parameter is required' }), { status: 400 });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock}&token=${FINNHUB_API_KEY}`);
    if (!response.ok) {
      console.log('Error response from Finnhub:', response.statusText);
      throw new Error('Error response from Finnhub');
    }
    const data = await response.json() as FinnhubResponse;

    if (data.c === undefined || data.h === undefined || data.l === undefined || data.o === undefined || data.pc === undefined) {
      console.log('Invalid stock symbol or data');
      return new Response(JSON.stringify({ error: 'Invalid stock symbol or data' }), { status: 400 });
    }

    const prices = [data.c, data.h, data.l, data.o, data.pc];
    const dates = ['Current', 'High', 'Low', 'Open', 'Previous Close'];

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
