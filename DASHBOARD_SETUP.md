# Bitzxier Dashboard Setup Guide

This project now includes a **feature/module dashboard** that scans the full codebase and shows:

- command categories + command counts
- event modules
- log modules
- model modules

The UI theme uses a red/black/dark-red palette with gray/white contrast.

## 1) Environment variables

Create a `.env` file in the project root (`/workspace/Bitzxier/.env`) and add:

```env
# Dashboard
ENABLE_DASHBOARD=true
DASHBOARD_PORT=3000

# Discord OAuth for dashboard login
DISCORD_CLIENT_ID=your_discord_app_client_id
DISCORD_CLIENT_SECRET=your_discord_app_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

> Keep your client secret private and never commit it to git.

## 2) Discord Developer Portal (Redirect setup)

1. Open: https://discord.com/developers/applications
2. Select your bot application.
3. Go to **OAuth2 → General**.
4. Copy your **Client ID** and **Client Secret** into `.env`.
5. Under **Redirects**, add:
   - `http://localhost:3000/auth/discord/callback` (local)
   - Your production URL callback (example): `https://your-domain.com/auth/discord/callback`
6. Save changes.

## 3) Install and run

```bash
npm install
npm start
```

Dashboard starts with bot startup and is available at:

- `http://localhost:3000/`

## 4) Routes

- `GET /` → dashboard page
- `GET /api/scan` → JSON scan of codebase modules/features
- `GET /health` → health check
- `GET /auth/discord` → starts Discord OAuth flow
- `GET /auth/discord/callback` → OAuth callback/token exchange

## 5) Production deployment notes

- Set `DISCORD_REDIRECT_URI` to your HTTPS domain callback.
- Ensure reverse proxy forwards traffic to `DASHBOARD_PORT`.
- If you want to disable dashboard temporarily, set:

```env
ENABLE_DASHBOARD=false
```

## 6) Security reminders

- Never hardcode secrets in source files.
- Use environment variables for all sensitive keys.
- Regenerate secret in Discord portal if leaked.
