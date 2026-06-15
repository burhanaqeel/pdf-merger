#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env.production ]]; then
  echo "Error: .env.production not found in $(pwd)"
  echo ""
  echo "Create it with:"
  echo "  nano .env.production"
  echo ""
  echo "Paste:"
  cat <<'EOF'
NODE_ENV=production
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://139.162.60.105:3001
NEXT_TELEMETRY_DISABLED=1
EOF
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.production
set +a

echo "Deploying PDF Merger to ${NEXT_PUBLIC_APP_URL} ..."

docker compose --env-file .env.production --profile prod down
docker compose --env-file .env.production --profile prod up --build -d
docker compose --env-file .env.production --profile prod ps

echo ""
echo "Deployment complete."
echo "Open: ${NEXT_PUBLIC_APP_URL}"
