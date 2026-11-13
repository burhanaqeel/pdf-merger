#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  if [[ -f .env.production ]]; then
    cp .env.production .env
    echo "Created .env from .env.production"
  else
    echo "Missing .env in $ROOT_DIR"
    echo "Copy .env.production to .env, then run this script again."
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

echo "Building and starting PDF Merger on ${NEXT_PUBLIC_APP_URL:-http://localhost:3001}"

docker compose --env-file .env --profile prod up --build -d
docker compose --env-file .env --profile prod ps

echo
echo "Done. Open: ${NEXT_PUBLIC_APP_URL:-http://localhost:3001}"
