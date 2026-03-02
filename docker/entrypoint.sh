#!/bin/sh
set -eu

required_vars="CARELINK_USERNAME CARELINK_PASSWORD API_SECRET NS"
for var_name in $required_vars; do
  eval "value=\${$var_name:-}"
  if [ -z "$value" ]; then
    echo "[Bridge] Missing required environment variable: $var_name" >&2
    exit 1
  fi
done

LOGINDATA_PATH="${CARELINK_LOGINDATA_FILE:-/app/data/logindata.json}"
mkdir -p "$(dirname "$LOGINDATA_PATH")"

if [ ! -f "$LOGINDATA_PATH" ]; then
  echo "[Bridge] No login data found at $LOGINDATA_PATH"
  echo "[Bridge] Running login flow..."
  node dist/login.js
fi

exec node dist/main.js
