#!/usr/bin/env bash
# ============================================================
# test-lastfm.sh
#
# Tests the Last.fm API directly with curl — useful for
# verifying credentials and the API response format before
# relying on the website widget.
#
# Usage:
#   1. Set your API key and username:
#      export LASTFM_API_KEY="your_key_here"
#      export LASTFM_USER="nots1dd"
#
#   2. Run the script:
#      ./scripts/test-lastfm.sh
#
#   3. Check the output — a valid response includes
#      track name, artist, and optionally "nowplaying": true.
# ============================================================

set -euo pipefail

API_KEY="${LASTFM_API_KEY:-}"
API_USER="${LASTFM_USER:-nots1dd}"

if [[ -z "$API_KEY" ]]; then
  cat >&2 <<'MSG'
ERROR: LASTFM_API_KEY is not set.

Get an API key at https://www.last.fm/api/account/create, then:

  export LASTFM_API_KEY="your_key_here"
  ./scripts/test-lastfm.sh
MSG
  exit 1
fi

URL="https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${API_USER}&api_key=${API_KEY}&format=json&limit=1"

echo "Fetching now-playing for user: ${API_USER}"
echo "URL: ${URL}"
echo "---"

RESPONSE=$(curl -s --max-time 5 "$URL")

if ! echo "$RESPONSE" | python3 -m json.tool 2>/dev/null; then
  echo "ERROR: Invalid JSON response or network error"
  echo "Raw response: $RESPONSE"
  exit 1
fi

TRACK=$(echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
tracks = data.get('recenttracks', {}).get('track', [])
if not tracks:
    print('NO_TRACKS')
    sys.exit(0)
t = tracks[0]
now = 'NOW_PLAYING' if t.get('@attr', {}).get('nowplaying') else 'LAST_PLAYED'
print(f\"{now}: {t.get('name', '?')} — {t.get('artist', {}).get('#text', '?')}\")
print(f\"  album: {t.get('album', {}).get('#text', '?')}\" )
imgs = [i['#text'] for i in t.get('image', []) if i.get('#text')]
if imgs:
    print(f\"  image: {imgs[0]}\")
")

echo "$TRACK"
echo "---"
echo "OK: Last.fm API is reachable and credentials are valid."
