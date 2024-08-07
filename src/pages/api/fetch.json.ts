import type { APIRoute } from 'astro';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config(); // Load environment variables from .env

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

console.log('Alpha Vantage API Key:', ALPHA_VANTAGE_API_KEY); // Log the API key to ensure it's loaded

export const GET: APIRoute = async ({ request }) => {
  console.log('API endpoint hit'); // Ensure endpoint is hit
  const url = new URL(request.url);
  console.log('Full URL:', request.url); // Log full URL
  console.log('Query parameters:', url.searchParams.toString()); // Log query parameters

  // Extracting the stock parameter
  const stock = url.searchParams.get('stock');
  console.log('Extracted stock parameter:', stock); // Log the extracted stock parameter

  if (!stock) {
    console.log('No stock parameter');
    return new Response(JSON.stringify({ error: 'Stock parameter is required' }), { status: 400 });
  }

  try {
    console.log(`Fetching data for stock: ${stock}`);
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stock}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    console.log('Data received from Alpha Vantage:', data);

    if (data['Error Message']) {
      console.log('Invalid stock symbol');
      return new Response(JSON.stringify({ error: 'Invalid stock symbol' }), { status: 400 });
    }

    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries);
    const prices = dates.map(date => timeSeries[date]['4. close']);

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
