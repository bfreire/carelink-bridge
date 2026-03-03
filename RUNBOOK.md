# CareLink Bridge Runbook (Docker + Portainer)

This runbook explains how to deploy and operate the CareLink bridge in Portainer, including what to do when CareLink tokens expire.

## 1. Prerequisites

- A running Docker host (for example, ZimaOS).
- Portainer access.
- A Nightscout instance and API secret.
- A persistent host folder for bridge data (for example: `/path/on/host/carelink-bridge`).

## 2. Recommended Stack Configuration

Use a stack similar to this:

```yaml
services:
  carelink-bridge:
    platform: linux/amd64
    image: bfreire/carelink-bridge:latest
    container_name: carelink-bridge
    restart: unless-stopped
    environment:
      CARELINK_USERNAME: "<carelink-username>"
      CARELINK_PASSWORD: "<carelink-password>"
      API_SECRET: "<nightscout-api-secret>"
      NS: "https://<nightscout-host>"
      MMCONNECT_SERVER: "EU" # or US
      CARELINK_LOGINDATA_FILE: "/app/data/logindata.json"
      CARELINK_NON_INTERACTIVE: "true"
      PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium"
      PUPPETEER_HEADLESS: "true"
      USE_PROXY: "false"
    volumes:
      - /path/on/host/carelink-bridge:/app/data
```

Important:
- Do not use `env_file` in Portainer unless the file is guaranteed to exist in the stack workspace.
- Keep `CARELINK_NON_INTERACTIVE=true` in server mode.

## 3. First Deployment

1. Deploy the stack in Portainer.
2. Confirm the container starts.
3. If logs show login fallback to browser/CAPTCHA, continue with section 4.

## 4. One-Time Interactive Login (Token Bootstrap)

Because server containers are non-interactive, generate `logindata.json` on a local machine first.

Run this from a machine with Docker:

```bash
docker run --rm -it \
  --entrypoint node \
  -e CARELINK_USERNAME="<carelink-username>" \
  -e CARELINK_PASSWORD="<carelink-password>" \
  -e MMCONNECT_SERVER="EU" \
  -e CARELINK_NON_INTERACTIVE="false" \
  -e CARELINK_LOGINDATA_FILE="/app/data/logindata.json" \
  -e PUPPETEER_EXECUTABLE_PATH="/does-not-exist" \
  -v /local/path/carelink-data:/app/data \
  bfreire/carelink-bridge:latest \
  dist/login.js
```

What to do during login:
1. Open the URL printed by the script.
2. Complete login and CAPTCHA in your browser.
3. Copy the final callback URL containing `code=...`.
4. Paste it back into the terminal when prompted.

Then verify:

```bash
ls -l /local/path/carelink-data/logindata.json
```

## 5. Move Login Data to Server

1. Copy `logindata.json` to the host data folder used by the stack:
   `/path/on/host/carelink-bridge/logindata.json`
2. In Portainer, redeploy (or restart) the stack.
3. Validate logs: the bridge should start without "No login data found".

## 6. Normal Operations Checklist

Run this check periodically:
1. Container is `running`.
2. Restart count is stable (not increasing).
3. Logs do not show:
   - `Refresh token expired`
   - `No login data found`
   - `Fatal`

## 7. When Token Expires

Symptoms in logs:
- `Refresh token expired. Run "npm run login" to log in again.`

Recovery:
1. Repeat section 4 to generate a new `logindata.json`.
2. Replace the file on the server host data folder.
3. Restart/redeploy the stack.

## 8. Security Notes

- Treat `logindata.json` as sensitive (contains tokens).
- Restrict file access permissions on the host data directory.

## 9. Quick Troubleshooting

- `env file .../.env not found`:
  Remove `env_file` from stack and define values directly under `environment`.
- `exec format error`:
  Image architecture mismatch. Use multi-arch image or set `platform` correctly.
- `pull access denied`:
  Image is missing in registry or name/tag is wrong.
