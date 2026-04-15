const express = require('express');
const axios = require('axios');
const { scanModules } = require('./scanner');

function buildHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bitzxier Dashboard</title>
  <style>
    :root {
      --bg-black: #090909;
      --bg-dark-red: #1a0505;
      --primary-red: #d11212;
      --secondary-red: #7a0b0b;
      --text-white: #f6f7f8;
      --text-muted: #c3c7cd;
      --gray: #2a2f35;
      --gray-light: #e1e5ea;
      --card: #141519;
      --border: #2b2c31;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, Segoe UI, Roboto, Arial, sans-serif;
      color: var(--text-white);
      background: radial-gradient(circle at top right, var(--bg-dark-red), var(--bg-black));
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 16px 48px;
    }

    .header {
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      background: linear-gradient(120deg, #180808, #090909);
      margin-bottom: 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
      color: #fff;
      letter-spacing: 0.02em;
    }

    .header p {
      margin: 8px 0 0;
      color: var(--text-muted);
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    button {
      background: linear-gradient(180deg, var(--primary-red), var(--secondary-red));
      color: var(--text-white);
      border: 1px solid #420808;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
    }

    .meta {
      margin-top: 12px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .cards {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      margin-bottom: 18px;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
    }

    .card .label {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .card .value {
      font-size: 1.5rem;
      color: #ffffff;
      font-weight: 700;
    }

    .panel {
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      background: #0f1014;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #1f2026;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #252831;
      vertical-align: top;
      font-size: 0.95rem;
    }

    th {
      color: var(--gray-light);
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .tag {
      background: #2a0a0a;
      border: 1px solid #4e1515;
      color: #ffd3d3;
      border-radius: 999px;
      padding: 2px 8px;
      display: inline-block;
      font-size: 0.8rem;
      margin-bottom: 6px;
    }

    .feature-list {
      color: #f0f0f0;
      opacity: 0.9;
      line-height: 1.5;
      word-break: break-word;
      max-height: 105px;
      overflow: auto;
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="header">
      <h1>Bitzxier Feature & Module Dashboard</h1>
      <p>Auto-scans your codebase and groups commands, events, logs, and models into modules.</p>
      <div class="actions">
        <button id="refreshButton">Refresh Scan</button>
        <button id="loginButton">Login with Discord</button>
      </div>
      <div class="meta" id="scanMeta">Loading scan details...</div>
    </section>

    <section class="cards" id="summaryCards"></section>

    <section class="panel">
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Type</th>
            <th>Feature Count</th>
            <th>Features</th>
          </tr>
        </thead>
        <tbody id="moduleRows">
          <tr><td colspan="4">Loading module data...</td></tr>
        </tbody>
      </table>
    </section>
  </main>

  <script>
    async function fetchDashboardData() {
      const response = await fetch('/api/scan');
      if (!response.ok) {
        throw new Error('Unable to load dashboard data');
      }
      return response.json();
    }

    function renderSummary(summary) {
      const cards = [
        ['Total Modules', summary.moduleCount],
        ['Command Categories', summary.commandCategoryCount],
        ['Commands', summary.commandCount],
        ['Events', summary.eventCount],
        ['Logs', summary.logCount],
        ['Models', summary.modelCount],
      ];

      const summaryCards = document.getElementById('summaryCards');
      summaryCards.innerHTML = cards
        .map(([label, value]) => '\n          <article class="card">\n            <div class="label">' + label + '</div>\n            <div class="value">' + value + '</div>\n          </article>\n        ')
        .join('');

      const meta = document.getElementById('scanMeta');
      meta.textContent = 'Scanned at: ' + new Date(summary.scannedAt).toLocaleString();
    }

    function renderModules(modules) {
      const rows = document.getElementById('moduleRows');
      rows.innerHTML = modules
        .map((module) => '\n          <tr>\n            <td>' + module.name + '</td>\n            <td><span class="tag">' + module.type + '</span></td>\n            <td>' + module.featureCount + '</td>\n            <td><div class="feature-list">' + (module.features.join(', ') || '-') + '</div></td>\n          </tr>\n        ')
        .join('');
    }

    async function refresh() {
      try {
        const data = await fetchDashboardData();
        renderSummary(data.summary);
        renderModules(data.modules);
      } catch (error) {
        const rows = document.getElementById('moduleRows');
        rows.innerHTML = '<tr><td colspan="4">Failed to load dashboard data.</td></tr>';
        document.getElementById('scanMeta').textContent = error.message;
      }
    }

    document.getElementById('refreshButton').addEventListener('click', refresh);
    document.getElementById('loginButton').addEventListener('click', () => {
      window.location.href = '/auth/discord';
    });
    refresh();
  </script>
</body>
</html>`;
}


function getOAuthConfig() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI,
  };
}

function createDashboardServer({ client, port }) {
  const app = express();

  app.get('/', (_req, res) => {
    res.type('html').send(buildHtml());
  });


  app.get('/auth/discord', (_req, res) => {
    const oauth = getOAuthConfig();

    if (!oauth.clientId || !oauth.redirectUri) {
      return res
        .status(500)
        .json({ error: 'Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI in environment.' });
    }

    const params = new URLSearchParams({
      client_id: oauth.clientId,
      redirect_uri: oauth.redirectUri,
      response_type: 'code',
      scope: 'identify guilds',
      prompt: 'consent',
    });

    return res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  });

  app.get('/auth/discord/callback', async (req, res) => {
    const oauth = getOAuthConfig();
    const code = req.query.code;

    if (!code) {
      return res.status(400).send('Missing OAuth code parameter.');
    }

    if (!oauth.clientId || !oauth.clientSecret || !oauth.redirectUri) {
      return res.status(500).send('OAuth environment variables are missing.');
    }

    try {
      const tokenResponse = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: oauth.clientId,
          client_secret: oauth.clientSecret,
          grant_type: 'authorization_code',
          code: String(code),
          redirect_uri: oauth.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;
      const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return res.json({
        success: true,
        user: userResponse.data,
      });
    } catch (error) {
      const detail = error?.response?.data || error.message;
      return res.status(500).json({
        success: false,
        error: 'Discord OAuth failed',
        detail,
      });
    }
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/scan', (_req, res) => {
    const scan = scanModules();
    const botDetails = {
      userTag: client?.user?.tag ?? null,
      guilds: client?.guilds?.cache?.size ?? 0,
      users: client?.users?.cache?.size ?? 0,
      uptimeMs: client?.uptime ?? 0,
    };

    res.json({
      ...scan,
      bot: botDetails,
    });
  });

  const server = app.listen(port, () => {
    console.log(`[Dashboard] Running on http://localhost:${port}`);
  });

  return server;
}

module.exports = {
  createDashboardServer,
};
