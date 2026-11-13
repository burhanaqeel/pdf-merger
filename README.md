# PDF Merger

A small browser tool that merges PDF files from different folders when they share the same file name.

Your files stay on your device. Nothing is uploaded to any server.

## What it does

1. Add two or more folders that contain PDFs
2. Review which files will be merged together
3. Reorder or remove pages if you need to
4. Download the result as a ZIP folder

## Run it on your computer

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3001
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_TELEMETRY_DISABLED=1
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3001

## Notes

- Works best in Chrome or Edge
- Only top-level PDF files in each folder are used (no nested folders)
- Matching is based on file name
