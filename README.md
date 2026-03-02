# carelink-bridge

Sends your Medtronic pump and CGM data to [Nightscout](http://www.nightscout.info/) automatically.

It connects to Medtronic's CareLink servers the same way the official CareLink app does, grabs your latest pump and sensor data, and uploads it to your Nightscout site on a regular interval.

## What you need

- [Node.js](https://nodejs.org) version 18 or newer (download and install it if you don't have it)
- A [CareLink](https://carelink.minimed.com/) account with a connected pump (MiniMed 7xxG, MiniMed Connect, or Guardian Connect)
- A working [Nightscout](http://www.nightscout.info/) site

## Run with Docker (recommended for ZimaOS)

### 1. Create `.env`

```bash
cp .env.example .env
```

Edit `.env` and set at least:

```env
CARELINK_USERNAME=your-carelink-username
CARELINK_PASSWORD=your-carelink-password
API_SECRET=your-nightscout-api-secret
NS=https://your-nightscout-site.example.com
MMCONNECT_SERVER=EU
```

For US accounts, use:

```env
MMCONNECT_SERVER=US
```

### 2. Build and start

```bash
docker compose up -d --build
```

The container will:
- run login automatically if no saved token exists
- store token data in a persistent Docker volume
- start the bridge loop after login

### 3. Check logs

```bash
docker logs -f carelink-bridge
```

### ZimaOS setup

Use a custom Docker Compose app and point it to this project's `docker-compose.yml`.

- Upload/copy this project to your ZimaOS host
- Edit `.env` with your CareLink and Nightscout values
- Start the app from ZimaOS (or run `docker compose up -d --build`)

After first successful login, restarts are automatic and reuse saved login data.

### Docker files included

- `Dockerfile`
- `docker-compose.yml`
- `docker/entrypoint.sh`

---

## Run directly with Node.js

### 1. Download and install

Download or clone this repository, then open a terminal in the project folder and run:

```
npm install
npm run build
```

### 2. Configure

Make a copy of the file `.env.example` and name it `.env`. Open it in any text editor and fill in your details:

```env
CARELINK_USERNAME=your-carelink-username
CARELINK_PASSWORD=your-carelink-password
API_SECRET=your-nightscout-api-secret
NS=https://your-nightscout-site.example.com
```

- **CARELINK_USERNAME / PASSWORD** — the same email and password you use to log in to CareLink
- **API_SECRET** — your Nightscout API secret (the same one you set up when you created your Nightscout site)
- **NS** — the full URL of your Nightscout site, starting with `https://`

If you're in the US, also add this line:

```env
MMCONNECT_SERVER=US
```

(The default is EU.)

### 3. Log in

Run:

```
npm run login
```

This will try to log in automatically. If CareLink asks for a CAPTCHA, a browser window will open — just log in like you normally would. Once you're in, the window closes by itself and your login is saved.

You only need to do this once. Your login tokens are saved in a file called `logindata.json`.

### 4. Start the bridge

```
npm start
```

That's it! The bridge will fetch your data every 5 minutes and upload it to Nightscout. Leave it running in the background.

## Troubleshooting

- **"No logindata.json found"** — Run `npm run login` first.
- **Login expired** — Delete the `logindata.json` file and run `npm run login` again.
- **Data not showing up in Nightscout** — Make sure your `NS` URL and `API_SECRET` are correct in the `.env` file.
- **US users seeing errors** — Make sure you have `MMCONNECT_SERVER=US` in your `.env` file.

## Settings

All settings go in the `.env` file. Only the first four are required — the rest are optional.

| Setting | Default | What it does |
|---|---|---|
| `CARELINK_USERNAME` | *(required)* | Your CareLink email/username |
| `CARELINK_PASSWORD` | *(required)* | Your CareLink password |
| `API_SECRET` | *(required)* | Your Nightscout API secret |
| `NS` | *(required)* | Your Nightscout URL (e.g. `https://mysite.herokuapp.com`) |
| `MMCONNECT_SERVER` | `EU` | Set to `US` if you're in the United States |
| `MMCONNECT_COUNTRYCODE` | `gb` | Your country code (e.g. `us`, `de`, `nl`) |
| `CARELINK_INTERVAL` | `300` | How often to fetch data, in seconds (300 = 5 minutes) |
| `CARELINK_PATIENT` | | Patient username, only needed if your care partner account has multiple patients |
| `CARELINK_QUIET` | `true` | Set to `false` to see more detailed logs |
| `CARELINK_NON_INTERACTIVE` | `false` | Set to `true` for container/server mode (fails instead of prompting terminal input) |
| `CARELINK_LOGINDATA_FILE` | `logindata.json` | Path where login tokens are saved |
| `PUPPETEER_EXECUTABLE_PATH` | auto-detect | Browser path for fallback login |
| `PUPPETEER_HEADLESS` | auto | Set `true` to run browser fallback in headless mode |
| `USE_PROXY` | `true` | Set to `false` if you do not use proxy list rotation |

## For developers

```bash
npm run dev       # Run directly from TypeScript (no build needed)
npm run build     # Compile TypeScript
npm test          # Run tests
```

## Acknowledgements

Inspired by [nightscout/minimed-connect-to-nightscout](https://github.com/nightscout/minimed-connect-to-nightscout), the original MiniMed Connect to Nightscout bridge by Mark Wilson and the Nightscout community.

## Disclaimer

This project is for educational and informational purposes only. It is not FDA approved and should not be used to make medical decisions. It is not affiliated with or endorsed by Medtronic, and may violate their Terms of Service.

## License

[MIT](LICENSE)
