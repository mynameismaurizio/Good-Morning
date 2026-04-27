function mapGif(g) {
  const im = g.images || {};
  const thumb = im.fixed_width_small || im.fixed_width || im.downsized;
  const full = im.downsized_medium || im.downsized_large || im.original || im.fixed_width;
  return {
    id: g.id,
    title: g.title || '',
    preview: (thumb && thumb.url) || '',
    url: (full && full.url) || (im.original && im.original.url) || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const key = process.env.GIPHY_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'Giphy not configured' });
  }
  const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 12));

  if (req.query.trending === '1' || req.query.trending === 'true') {
    const url =
      'https://api.giphy.com/v1/gifs/trending?api_key=' +
      encodeURIComponent(key) +
      '&limit=' +
      limit +
      '&rating=g';
    try {
      const r = await fetch(url);
      if (!r.ok) return res.status(502).json({ error: 'Giphy request failed' });
      const body = await r.json();
      const items = (body.data || []).map(mapGif);
      return res.status(200).json({ gifs: items });
    } catch {
      return res.status(502).json({ error: 'Giphy request failed' });
    }
  }

  const q = (req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: 'q required' });
  }
  const url =
    'https://api.giphy.com/v1/gifs/search?api_key=' +
    encodeURIComponent(key) +
    '&q=' +
    encodeURIComponent(q) +
    '&limit=' +
    limit +
    '&rating=g&lang=en';
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ error: 'Giphy request failed' });
    }
    const body = await r.json();
    const items = (body.data || []).map(mapGif);
    return res.status(200).json({ gifs: items });
  } catch {
    return res.status(502).json({ error: 'Giphy request failed' });
  }
}
