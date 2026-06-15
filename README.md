# PDF Merger

Merge PDF files from multiple folders by matching file names. Runs entirely in the browser — no uploads to a server.

## Project structure

```
pdf-merger/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UI components
│   └── lib/              # PDF parsing, matching, merge logic
├── public/
├── scripts/
│   └── deploy.sh         # Production deploy on the VM
├── Dockerfile            # Production image
├── Dockerfile.dev        # Local Docker development
├── docker-compose.yml
├── .env.local            # Local env (gitignored)
└── .env.production       # Server env (gitignored)
```

## Environment variables

| Variable | Local | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `PORT` | `3001` | `3001` |
| `HOSTNAME` | `0.0.0.0` | `0.0.0.0` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` | `http://139.162.60.105:3001` |
| `NEXT_TELEMETRY_DISABLED` | `1` | `1` |

### Local (this machine)

File: `.env.local` (already created)

```env
NODE_ENV=development
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_TELEMETRY_DISABLED=1
```

### Production (VM at 139.162.60.105)

File: `.env.production` (copy from `.env.production.example` on the server)

```env
NODE_ENV=production
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://139.162.60.105:3001
NEXT_TELEMETRY_DISABLED=1
```

## Local development

**Without Docker:**

```bash
npm install
npm run dev
```

Open http://localhost:3001

**With Docker:**

```bash
npm run docker:dev
```

## Production deployment

Target URL: **http://139.162.60.105:3001**

### 1. Push to GitHub (from your machine)

```bash
git add .
git commit -m "Prepare PDF Merger for production deployment"
git remote add origin https://github.com/YOUR_USERNAME/pdf-merger.git
git push -u origin main
```

Use `master` instead of `main` if that is your default branch.

### 2. First-time setup on the VM

SSH into the server, then:

```bash
# Install Docker if not already installed
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in so docker group applies

# Clone the repo
cd ~
git clone https://github.com/YOUR_USERNAME/pdf-merger.git
cd pdf-merger

# Create production env
cp .env.production.example .env.production

# Open port 3001 in the firewall (if ufw is enabled)
sudo ufw allow 3001/tcp
sudo ufw status

# Build and start
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Redeploy after changes

On the VM:

```bash
cd ~/pdf-merger
git pull
./scripts/deploy.sh
```

Or:

```bash
npm run deploy
```

### 4. Useful commands on the server

```bash
docker compose --env-file .env.production --profile prod ps          # container status
docker compose --env-file .env.production --profile prod logs -f     # live logs
docker compose --env-file .env.production --profile prod down        # stop app
```

## Notes

- The app at http://139.162.60.105/ (port 80) is a separate service. PDF Merger runs on **port 3001**.
- To serve it at the root URL without `:3001`, add an nginx reverse proxy later.
- PDF processing happens in the user's browser. The server only serves the Next.js app.
