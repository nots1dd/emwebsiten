export default async function handler(req, res) {
  const { LASTFM_API_KEY, LASTFM_USER } = process.env;
  if (!LASTFM_API_KEY || !LASTFM_USER) {
    return res.status(200).json({ error: "not configured" });
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    const track = data?.recenttracks?.track?.[0];
    if (!track) return res.status(200).json({ error: "no tracks" });

    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    res.status(200).json({
      nowplaying: !!track["@attr"]?.nowplaying,
      artist: track.artist?.["#text"] ?? "",
      name: track.name ?? "",
      album: track.album?.["#text"] ?? "",
      image: track.image?.find((i) => i.size === "small")?.["#text"] ?? "",
    });
  } catch {
    res.status(200).json({ error: "fetch failed" });
  }
}
