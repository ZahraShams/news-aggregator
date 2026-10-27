#!/bin/sh
# Writes the API keys and base URLs from the container's environment into
# config.js, so they are never built into the image and one image works with
# any keys. An empty base URL falls back to the app's default address.
set -e

escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  guardianKey: "$(escape "$VITE_GUARDIAN_KEY")",
  guardianBaseUrl: "$(escape "$VITE_GUARDIAN_BASE_URL")",
  nytKey: "$(escape "$VITE_NYT_KEY")",
  nytBaseUrl: "$(escape "$VITE_NYT_BASE_URL")",
  newsApiKey: "$(escape "$VITE_NEWSAPI_KEY")",
  newsApiBaseUrl: "$(escape "$VITE_NEWSAPI_BASE_URL")"
};
EOF
