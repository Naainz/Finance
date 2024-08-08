import type { APIRoute } from 'astro';
import { formatISO } from 'date-fns';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const stock = url.searchParams.get('stock');
  const range = url.searchParams.get('range');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  if (!stock || !range) {
    return new Response(JSON.stringify({ error: 'Stock and range parameters are required' }), { status: 400 });
  }

  const apiKey = import.meta.env.FINNHUB_API_KEY;

  let from: string;
  let to: string = formatISO(new Date(), { representation: 'date' });

  if (range === 'custom' && startDate && endDate) {
    from = startDate;
    to = endDate;
  } else {
    switch (range) {
      case '1W':
        from = formatISO(new Date(new Date().setDate(new Date().getDate() - 7)), { representation: 'date' });
        break;
      case '1M':
        from = formatISO(new Date(new Date().setMonth(new Date().getMonth() - 1)), { representation: 'date' });
        break;
      case '1Y':
        from = formatISO(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), { representation: 'date' });
        break;
      default:
        from = formatISO(new Date(new Date().setMonth(new Date().getMonth() - 1)), { representation: 'date' });
        break;
    }
  }

  const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(stock)}&from=${from}&to=${to}&token=${apiKey}`;

  try {
    const newsResponse = await fetch(newsUrl);
    const newsData = await newsResponse.json();

    if (!Array.isArray(newsData)) {
      throw new Error(newsData.error || 'Error fetching news');
    }

    const articles = newsData.map(article => ({
      title: article.headline,
      description: article.summary,
      url: article.url,
    }));

    return new Response(JSON.stringify({ articles }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
