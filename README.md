# PDF Merger

Merge PDF files from multiple folders by matching file names. All processing runs in the browser — files never leave the device.

**Live:** http://139.162.60.105:3001  
**Repo:** https://github.com/burhanaqeel/pdf-merger

## App flow

1. **Upload** — Add folders of PDFs (no subfolders)
2. **Sources** — Reorder which PDFs are combined per output file
3. **Pages** — Tab per merged file; preview thumbnails and reorder/remove pages
4. **Download** — Named folder as ZIP (or save directly to disk in Chrome/Edge)

## Project structure

```
src/
├── app/                    # Next.js layout, styles, entry page
├── components/
│   ├── ui/                 # Button, Input, Badge
│   ├── PdfMergerApp.tsx    # Shell & step routing
│   ├── FolderUploadPanel.tsx
│   ├── MergePreviewPanel.tsx
│   ├── PageArrangePanel.tsx
│   ├── PageThumbnail.tsx
│   ├── DownloadPanel.tsx
│   └── StepIndicator.tsx
├── hooks/
│   └── usePdfMerger.ts     # App state & actions
├── lib/
│   ├── array.ts            # Reorder helper
│   ├── download.ts         # ZIP download, folder save, merge output
│   ├── folder-name.ts      # Output folder naming
│   ├── folder-parser.ts    # Folder upload parsing
│   ├── id.ts
│   ├── matching.ts         # Group PDFs by filename
│   ├── pages.ts            # Build page lists for arrange step
│   ├── types.ts
│   └── pdf/
│       ├── merge-pages.ts  # Page-order merge (pdf-lib)
│       ├── thumbnail.ts    # Page previews (pdfjs-dist)
│       └── utils.ts        # PDF validation & page count
└── types/
    └── file-system.d.ts    # Directory picker types
```

## Environment files

Not committed to Git — create manually on each machine.

### `.env.local` (Windows / local dev)

```env
NODE_ENV=development
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_TELEMETRY_DISABLED=1
```

### `.env.production` (VM)

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

## Update production server

After pushing changes to GitHub:

```bash
# 1. On your machine
git add .
git commit -m "Your message"
git push

# 2. On the VM
cd /srv/PDF-MERGER
git pull
./scripts/deploy.sh
```

If `git pull` fails due to local changes on the server:

```bash
git checkout -- scripts/deploy.sh
git pull
sed -i 's/\r$//' scripts/deploy.sh
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Server commands

```bash
docker compose --env-file .env.production --profile prod ps
docker compose --env-file .env.production --profile prod logs -f
docker compose --env-file .env.production --profile prod down
```

## First-time server setup

```bash
cd /srv/PDF-MERGER
git clone https://github.com/burhanaqeel/pdf-merger.git .

nano .env.production   # paste production env from above

chmod +x scripts/deploy.sh
./scripts/deploy.sh
```
