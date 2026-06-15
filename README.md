# PDF Merger

Merge PDF files from multiple folders by matching file names. Runs entirely in the browser.

Repo: https://github.com/burhanaqeel/pdf-merger

## Environment files

These are **not** in Git. Create them manually on each machine.

### `.env.local` (your Windows machine)

```env
NODE_ENV=development
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_TELEMETRY_DISABLED=1
```

### `.env.production` (VM at 139.162.60.105)

```env
NODE_ENV=production
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://139.162.60.105:3001
NEXT_TELEMETRY_DISABLED=1
```

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3001

Docker dev: `npm run docker:dev`

## Production deployment on VM

Target: **http://139.162.60.105:3001**

### Clone into `/srv/PDF-MERGER` (not a subfolder)

If `/srv/PDF-MERGER` is empty:

```bash
cd /srv/PDF-MERGER
git clone https://github.com/burhanaqeel/pdf-merger.git .
```

Use `.` at the end so files land directly in `/srv/PDF-MERGER`, not `/srv/PDF-MERGER/pdf-merger`.

If SSH clone hangs, use HTTPS (above). SSH only works after adding a GitHub deploy key to the VM.

### First-time server setup

```bash
cd /srv/PDF-MERGER

# Create production env (not in Git)
nano .env.production
# Paste the production env block from above, save (Ctrl+O, Enter, Ctrl+X)

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and SSH back in

# Firewall
sudo ufw allow 3001/tcp

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Redeploy

```bash
cd /srv/PDF-MERGER
git pull
./scripts/deploy.sh
```

### Server commands

```bash
docker compose --env-file .env.production --profile prod ps
docker compose --env-file .env.production --profile prod logs -f
docker compose --env-file .env.production --profile prod down
```

## Troubleshooting clone

| Problem | Fix |
|---|---|
| `Cloning into 'pdf-merger'...` hangs | SSH key not set up — use HTTPS clone instead |
| Clone creates nested `pdf-merger/` folder | Use `git clone ... .` with `.` at the end |
| `destination path already exists` | Directory not empty — use empty dir or clone into `.` |
| `deploy.sh: cannot execute` | Run `sed -i 's/\r$//' scripts/deploy.sh` then `chmod +x scripts/deploy.sh` |
