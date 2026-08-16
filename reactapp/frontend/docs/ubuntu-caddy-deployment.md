# Deploy the frontend on Ubuntu with systemd and Caddy

This setup builds the React app once, runs its static server as an unprivileged
`systemd` service on `127.0.0.1:3050`, and exposes it over HTTPS through Caddy.
Port 3050 is intentionally not public.

## Prerequisites

- An Ubuntu server with Node.js 18 or newer, npm, Git, and Caddy installed.
- A DNS `A`/`AAAA` record for the app domain pointing to the server.
- Inbound TCP ports 80 and 443 allowed by the cloud firewall and Ubuntu firewall.
- A restricted public Mapbox token for the production domain.

Use [Caddy's official Ubuntu package instructions](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)
rather than an unofficial package. Confirm the installed tools before continuing:

```sh
node --version
npm --version
caddy version
```

## 1. Create the service account and deploy the repository

Run these commands with a sudo-capable account. Replace `REPOSITORY_URL` with
the repository's clone URL.

```sh
sudo useradd --system --create-home --home-dir /opt/musecology --shell /usr/sbin/nologin musecology
sudo -u musecology git clone REPOSITORY_URL /opt/musecology/repository
sudo ln -s /opt/musecology/repository/reactapp/frontend /opt/musecology/frontend
cd /opt/musecology/frontend
sudo -u musecology npm ci
```

If the frontend is the repository root, use this clone command instead and do
not create the symlink:

```sh
sudo -u musecology git clone REPOSITORY_URL /opt/musecology/frontend
```

## 2. Configure and build the frontend

Create the production environment file. A `REACT_APP_*` value is embedded in
the browser bundle at build time, so the token must be public and domain-restricted.

```sh
sudo -u musecology cp .env.example .env.production.local
sudoedit /opt/musecology/frontend/.env.production.local
sudo -u musecology npm run build
```

Set this value in the file:

```dotenv
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.your_restricted_public_token
```

The `HOST` and `PORT` values from `.env.example` may remain in the file; systemd
sets them explicitly when it starts the production server.

## 3. Install and start the systemd service

Check the Node executable path with `command -v node`. If it is not
`/usr/bin/node`, update `ExecStart` in the unit before installing it.

```sh
sudo cp deploy/musecology-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now musecology-frontend
sudo systemctl status musecology-frontend --no-pager
curl --fail --head http://127.0.0.1:3050/
```

Inspect logs with:

```sh
sudo journalctl -u musecology-frontend -n 100 --no-pager
```

Do not open port 3050 in UFW or the cloud firewall. The process listens only on
loopback, so Caddy can reach it but the internet cannot.

## 4. Configure Caddy

Copy the relevant site block from `deploy/Caddyfile` into `/etc/caddy/Caddyfile`
and replace `app.example.com` with the production domain.

```sh
sudoedit /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

Caddy obtains and renews HTTPS certificates automatically after DNS and ports
80/443 are correct. Verify the public endpoint:

```sh
curl --fail --head https://app.example.com/
```

## Updating the deployment

Build before restarting so the currently running version remains available if
the build fails:

```sh
cd /opt/musecology/repository
sudo -u musecology git pull --ff-only
cd /opt/musecology/frontend
sudo -u musecology npm ci
sudo -u musecology npm run build
sudo systemctl restart musecology-frontend
sudo systemctl status musecology-frontend --no-pager
```

For a frontend-only repository, run `git pull --ff-only` from
`/opt/musecology/frontend` instead.
