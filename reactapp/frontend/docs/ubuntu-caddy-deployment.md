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

## Automatic deployment from GitHub Actions

The repository includes a workflow that connects to the server whenever a
commit is pushed to `master`. The SSH key used by GitHub Actions should be able
to run only the deployment command, not an unrestricted shell.

### 1. Install the root-owned deployment command

Run these commands from the checked-out frontend directory on the server:

```sh
sudo install -o root -g root -m 0755 \
  deploy/deploy-production.sh /usr/local/sbin/musecology-deploy
sudo install -o root -g root -m 0440 \
  deploy/musecology-deploy.sudoers /etc/sudoers.d/musecology-deploy
sudo visudo -cf /etc/sudoers.d/musecology-deploy
```

The installed script is deliberately owned by root. Do not configure sudo to
execute the copy inside the Git checkout, because a repository update could
then modify code that runs as root.

The script assumes the full repository is located at
`/opt/musecology/repository`, the frontend symlink is
`/opt/musecology/frontend`, and the service is named
`musecology-frontend`. Adjust its constants before installing it if your server
uses different paths.

### 2. Create a deployment-only SSH account and key

Create a separate login account on the server:

```sh
sudo useradd --create-home --shell /bin/bash musecology-deploy
sudo install -d -o musecology-deploy -g musecology-deploy -m 0700 \
  /home/musecology-deploy/.ssh
```

Generate a dedicated key on a trusted workstation. Do not reuse a personal SSH
key:

```sh
ssh-keygen -t ed25519 -f github-actions-musecology -C github-actions-musecology
```

Add the public key to
`/home/musecology-deploy/.ssh/authorized_keys` as one line, prefixed with the
following restrictions:

```text
restrict,command="sudo -n /usr/local/sbin/musecology-deploy" ssh-ed25519 PUBLIC_KEY github-actions-musecology
```

Then secure the file:

```sh
sudo chown musecology-deploy:musecology-deploy \
  /home/musecology-deploy/.ssh/authorized_keys
sudo chmod 0600 /home/musecology-deploy/.ssh/authorized_keys
```

The `musecology` application account must still be able to pull the repository
from GitHub. For a private repository, configure a separate read-only GitHub
deploy key for that account.

### 3. Configure the GitHub production environment

In the GitHub repository, open **Settings → Environments**, create an
environment named `production`, and add these environment secrets:

- `DEPLOY_HOST`: the server hostname or IP address.
- `DEPLOY_USER`: `musecology-deploy`.
- `DEPLOY_SSH_PRIVATE_KEY`: the complete contents of
  `github-actions-musecology`.
- `DEPLOY_KNOWN_HOSTS`: the verified SSH host-key line for the server.
- `DEPLOY_PORT`: the SSH port; omit it to use port 22.

Create `DEPLOY_KNOWN_HOSTS` on a trusted workstation rather than disabling host
verification:

```sh
ssh-keyscan -p 22 your-server.example.com
```

Verify the resulting fingerprint against the server before storing it in
GitHub:

```sh
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

The workflow can also be started manually from the repository's **Actions**
page. Deployment output appears in the workflow log; server output remains
available through `journalctl -u musecology-frontend`.
