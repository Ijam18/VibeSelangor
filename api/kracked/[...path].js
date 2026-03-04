const TARGET_ORIGIN = 'https://krackeddevs.com';

function sanitizePath(rawPath = '') {
  const safe = String(rawPath).replace(/\.\./g, '').trim();
  if (!safe) return '/';
  return safe.startsWith('/') ? safe : `/${safe}`;
}

function sanitizeKrackedHtml(html = '') {
  return String(html)
    .replace(/<link[^>]+rel=["'](?:preload|modulepreload)["'][^>]*>/gi, '')
    .replace(/(["'])\/_next\//gi, `$1${TARGET_ORIGIN}/_next/`);
}

export default async function handler(req, res) {
  try {
    const pathSegments = Array.isArray(req.query?.path) ? req.query.path : [];
    const joined = pathSegments.join('/');
    const pathname = sanitizePath(joined);
    const targetUrl = `${TARGET_ORIGIN}${pathname}`;

    const response = await fetch(targetUrl, {
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
    res.send(`Kracked path proxy failed: ${error?.message || 'Unknown error'}`);
  }
}
