#!/bin/sh
# Writes the API keys from the container's environment into config.js, so the
# keys are never built into the image and one image works with any keys.
set -e

escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  guardianKey: "$(escape "$VITE_GUARDIAN_KEY")",
  nytKey: "$(escape "$VITE_NYT_KEY")",
  newsApiKey: "$(escape "$VITE_NEWSAPI_KEY")"
};
EOF
