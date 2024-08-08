import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const stock = url.searchParams.get('stock');
  const range = url.searchParams.get('range');
  const apiKey = import.meta.env.ALPHA_VANTAGE_API_KEY;

  if (!stock || !range) {
    return new Response(JSON.stringify({ error: 'Stock and range parameters are required' }), { status: 400 });
  }

  let functionType;
  let interval = '';
  switch (range) {
    case '1D':
      functionType = 'TIME_SERIES_INTRADAY';
      interval = '5min';
      break;
    case '1W':
      functionType = 'TIME_SERIES_DAILY';
      break;
    case '1M':
      functionType = 'TIME_SERIES_DAILY';
      break;
    case '1Y':
      functionType = 'TIME_SERIES_MONTHLY';
      break;
    case 'ALL':
      functionType = 'TIME_SERIES_MONTHLY';
      break;
    default:
      functionType = 'TIME_SERIES_DAILY';
      break;
  }

  let apiUrl = `https://www.alphavantage.co/query?function=${functionType}&symbol=${encodeURIComponent(stock)}&apikey=${apiKey}`;
  if (interval) {
    apiUrl += `&interval=${interval}`;
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    let timeSeriesKey = '';
    if (range === '1D') {
      timeSeriesKey = `Time Series (${interval})`;
    } else if (range === '1W' || range === '1M') {
      timeSeriesKey = 'Time Series (Daily)';
    } else {
      timeSeriesKey = 'Monthly Time Series';
    }

    const timeSeries = data[timeSeriesKey];
    const dates = Object.keys(timeSeries);
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

    return new Response(JSON.stringify({
      stock,
      dates: dates.reverse(),
      prices: prices.reverse()
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
