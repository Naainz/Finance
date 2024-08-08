import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const stock = url.searchParams.get('stock');
  const range = url.searchParams.get('range');
  const apiKey = import.meta.env.TWELVE_DATA_API_KEY;

  if (!stock || !range) {
    return new Response(JSON.stringify({ error: 'Stock and range parameters are required' }), { status: 400 });
  }

  let interval;
  switch (range) {
    case '1D':
      interval = '5min';
      break;
    case '1W':
      interval = '1h';
      break;
    case '1M':
      interval = '1day';
      break;
    case '1Y':
      interval = '1week';
      break;
    case 'ALL':
      interval = '1month';
      break;
    default:
      interval = '1day';
      break;
  }

  const apiUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(stock)}&interval=${interval}&apikey=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    const dates = data.values.map(value => value.datetime);
    const prices = data.values.map(value => parseFloat(value.close));

    // Filter data based on the range
    let filteredDates = dates;
    let filteredPrices = prices;
    if (range === '1W') {
      filteredDates = dates.slice(0, 7 * 24); // 1 week of hourly data
      filteredPrices = prices.slice(0, 7 * 24);
    } else if (range === '1M') {
      filteredDates = dates.slice(0, 30); // 1 month of daily data
      filteredPrices = prices.slice(0, 30);
    } else if (range === '1Y') {
      filteredDates = dates.slice(0, 52); // 1 year of weekly data
      filteredPrices = prices.slice(0, 52);
    }

    return new Response(JSON.stringify({
      stock,
      dates: filteredDates.reverse(),
      prices: filteredPrices.reverse(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
