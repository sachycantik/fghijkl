# NOXXY — Enterprise Temporary Email Platform

## Overview

NOXXY adalah platform temporary email dengan pengiriman berbasis Cloudflare
Email Worker, Vercel Serverless Functions, dan MongoDB Atlas.

## Architecture

```text
Internet → Cloudflare Email Routing → Cloudflare Email Worker
→ Vercel API (/api/inbound-email) → MongoDB Atlas
→ Server-Sent Events (SSE) → Browser Inbox
```

## Tech Stack

- Frontend: HTML5, CSS3, dan Vanilla JavaScript
- Backend: Node.js dan Vercel Serverless Functions
- Database: MongoDB Atlas dengan Mongoose
- Real-time backend: Server-Sent Events
- Email parsing: `mailparser`
- Email routing: Cloudflare Email Worker

## Folder Structure

```text
api/
  inbound-email.js
  inbox/index.js
  emails/[id].js
  stream.js
  domains.js
  admin/dashboard.js
lib/
  mongodb.js
  mailparser.js
  sseManager.js
  utils.js
  models/
public/
  index.html
  css/
  js/app.js
cloudflare-worker/
  index.js
scripts/
  cleanup-email-data.js
config.js
server.js
vercel.json
```

## Vercel Deployment

1. Push proyek ke GitHub.
2. Import repository ke Vercel.
3. Gunakan framework `Other`.
4. Build command: `npm install`.
5. Output directory: `public`.
6. Pastikan Cloudflare Worker mengarah ke URL produksi website.

## Email Retention and Cleanup

- Email baru mengikuti nilai `expiresAt` milik inbox.
- MongoDB TTL menghapus email dan lampiran setelah kedaluwarsa.
- Tombol hapus menghapus dokumen email dan lampiran secara permanen.
- Periksa data lama tanpa mengubah database:

```powershell
npm run cleanup:emails
```

- Terapkan pembersihan setelah laporan diperiksa:

```powershell
npm run cleanup:emails -- --apply
```

## User Preferences

- No emoji in UI
- Dark mode first
- Professional SaaS design
