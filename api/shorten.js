export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const url = (req.query?.url || req.body?.url || '').trim();
  if (!url || (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0)) {
    return res.status(400).json({ error: 'Valid http(s) URL required' });
  }
  try {
    const r = await fetch(
      'https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url),
      { redirect: 'follow' }
    );
    const text = await r.text();
    const shortUrl = text.trim();
    if (!shortUrl || shortUrl.indexOf('http') !== 0) {
      return res.status(502).json({ error: 'Shortener failed' });
    }
    return res.status(200).json({ shortUrl });
  } catch (err) {
    return res.status(502).json({ error: 'Shortener failed' });
  }
}
