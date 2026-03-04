const TARGET_ORIGIN = 'https://krackeddevs.com';

function buildHeaders(contentType = 'text/plain; charset=utf-8') {
  return {
    'content-type': contentType,
    'cache-control': 's-maxage=300, stale-while-revalidate=600'
  };
}

function sanitizeKrackedHtml(html = '') {
  return String(html)
    // Remove preload/modulepreload tags that trigger noisy warnings in host app.
    .replace(/<link[^>]+rel=["'](?:preload|modulepreload)["'][^>]*>/gi, '')
    // Rewrite root-relative Next.js assets to KrackedDevs origin.
    .replace(/(["'])\/_next\//gi, `$1${TARGET_ORIGIN}/_next/`);
}

async function proxyHtml(pathname = '/') {
  const targetUrl = `${TARGET_ORIGIN}${pathname}`;
  const response = await fetch(targetUrl, {
    headers: {
      'user-agent': 'VibeSelangorProxy/1.0 (+https://vibeselangor.vercel.app)',
      accept: 'text/html,application/xhtml+xml'
    }
  });

  const html = await response.text();
  return { ok: response.ok, status: response.status, html: sanitizeKrackedHtml(html) };
}

export default async function handler(req, res) {
  try {
    const proxied = await proxyHtml('/');
    res.status(proxied.status).setHeader('content-type', buildHeaders('text/html; charset=utf-8')['content-type']);
    res.setHeader('cache-control', buildHeaders()['cache-control']);
    res.send(proxied.html);
  } catch (error) {
    res.status(502).setHeader('content-type', buildHeaders()['content-type']);
    res.send(`Kracked proxy failed: ${error?.message || 'Unknown error'}`);
  }
}
