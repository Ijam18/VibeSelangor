const TARGET_ORIGIN = 'https://krackeddevs.com';

function sanitizeKrackedHtml(html = '') {
  return String(html)
    .replace(/<link[^>]+rel=["'](?:preload|modulepreload)["'][^>]*>/gi, '')
    .replace(/(["'])\/_next\//gi, `$1${TARGET_ORIGIN}/_next/`);
}

export default async function handler(req, res) {
  try {
    const response = await fetch(`${TARGET_ORIGIN}/showcase`, {
      headers: {
        'user-agent': 'VibeSelangorProxy/1.0 (+https://vibeselangor.vercel.app)',
        accept: 'text/html,application/xhtml+xml'
      }
    });

    const html = sanitizeKrackedHtml(await response.text());
    res.status(response.status);
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 's-maxage=300, stale-while-revalidate=600');
    res.send(html);
  } catch (error) {
    res.status(502).setHeader('content-type', 'text/plain; charset=utf-8');
    res.send(`Kracked showcase proxy failed: ${error?.message || 'Unknown error'}`);
  }
}
