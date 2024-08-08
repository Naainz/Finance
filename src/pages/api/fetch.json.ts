import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const stock = url.searchParams.get('stock');
  const range = url.searchParams.get('range');
  const twelveDataApiKey = import.meta.env.TWELVE_DATA_API_KEY;
  const fmpApiKey = import.meta.env.FMP_API_KEY;

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

  const twelveDataUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(stock)}&interval=${interval}&apikey=${twelveDataApiKey}`;
  const fmpUrl = `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(stock)}?apikey=${fmpApiKey}`;

  try {
    const [timeSeriesResponse, profileResponse] = await Promise.all([
      fetch(twelveDataUrl),
      fetch(fmpUrl)
    ]);

    const timeSeriesData = await timeSeriesResponse.json();
    const profileData = await profileResponse.json();

    if (timeSeriesData.status === 'error') {
      throw new Error(timeSeriesData.message);
    }
    if (!profileData || profileData.length === 0) {
      throw new Error('Error fetching profile data');
    }

    const dates = timeSeriesData.values.map(value => value.datetime);
    const prices = timeSeriesData.values.map(value => parseFloat(value.close));
    const profile = profileData[0];

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
      marketCap: profile.mktCap,
      description: profile.description
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
