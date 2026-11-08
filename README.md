<div align="center">

<img src=".github/assets/banner.png" alt="Death Note — an unofficial, cinematic notebook" width="100%" />

# DEATH NOTE

_Every name is a door. Some only open once._

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Three.js](https://img.shields.io/badge/Three.js-r187-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
<br />
[![License: MIT](https://img.shields.io/github/license/KortzLab/DeathNote?style=flat-square&color=8f0f12)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/KortzLab/DeathNote?style=flat-square&color=8f0f12)](https://github.com/KortzLab/DeathNote/commits)
[![Stars](https://img.shields.io/github/stars/KortzLab/DeathNote?style=flat-square&color=8f0f12)](https://github.com/KortzLab/DeathNote/stargazers)
[![CI](https://img.shields.io/github/actions/workflow/status/KortzLab/DeathNote/ci.yml?style=flat-square&label=CI)](https://github.com/KortzLab/DeathNote/actions/workflows/ci.yml)

**[Live Demo](https://deathnote.kortzlab.pro)** · **[h4sib.pro](https://h4sib.pro)** · **[kortzlab.pro](https://kortzlab.pro)** · **Discord:** `kirawth` · **Social:** `hasibwth`

</div>

---

A dark, atmospheric, heavily animated digital notebook inspired by the _concept_ of Death Note.
Styled in stark, rainy black and white with gothic cathedral light; red appears only where it
matters: apples, shinigami eyes and the last seconds before the ink sets.
Open the cursed book, read its rules, and write in ink. Everything you see is original: the
notebook, the shinigami, the rules, the cathedral backdrop, the sounds (synthesised in your browser) and the effects.

> [!NOTE]
> Unofficial fan project. Not affiliated with the creators or publishers of Death Note.
> For fiction and fun only. Don't use this to threaten or harass real people.

## 🎬 Preview

|                                                       The notebook falls                                                        |                                          The cover opens, pages curl                                           |
| :-----------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: |
|              <img src=".github/assets/screenshots/intro.png" alt="The notebook lying in the ash after its fall" />              | <img src=".github/assets/screenshots/intro-open.png" alt="The open 3D notebook, a page curling as it turns" /> |
|                                           **Writing in ink, with the 40-second ring**                                           |                                  **The rules write themselves as you scroll**                                  |
| <img src=".github/assets/screenshots/notebook.png" alt="Handwritten names in the notebook with countdown rings and a candle" /> |          <img src=".github/assets/screenshots/rules.png" alt="A rule being revealed word by word" />           |
|                                               **Sponsor modal (70% to charity)**                                                |                                           **Mobile (CSS fallback)**                                            |
|   <img src=".github/assets/screenshots/sponsor-modal.png" alt="Sponsor modal with amount chips and the live charity split" />   |     <img src=".github/assets/screenshots/mobile.png" alt="The lightweight intro on a phone" width="45%" />     |

<details>
<summary><b>Recording the GIFs (intro fall, page flip, ink writing, sponsor modal)</b></summary>

Animated previews are best recorded by hand. Placeholders to fill in:

- `.github/assets/gifs/intro-fall.gif` — load `/`, wait for the book to land and open it
- `.github/assets/gifs/page-flip.gif` — on `/notebook`, drag a page corner slowly
- `.github/assets/gifs/ink-writing.gif` — type a name and let the 40-second ring finish
- `.github/assets/gifs/sponsor-modal.gif` — open the wax seal, pick chips and a custom amount

On Windows: press <kbd>Win</kbd>+<kbd>Alt</kbd>+<kbd>R</kbd> (Xbox Game Bar) or use
[ScreenToGif](https://www.screentogif.com/) at 30 fps, 1280×720, then keep each GIF under ~8 MB.
Turn sound on in the header first if you also record video.

</details>

## ✨ Features

- **Cinematic intro (WebGL)** — drifting ash and embers, the notebook falls in slow motion, lands
  with a camera shake and a dust burst, tilts toward your cursor with light sliding over the
  leather. An etched gothic title flickers like embers. Click or drag to open the heavy cover.
- **A real-feeling book** — 3D pages that curl as they turn (vertex-shader bending), plus a DOM
  flip-book for writing with drag/swipe, edge buttons, <kbd>←</kbd> <kbd>→</kbd> and the mouse wheel,
  bending shadows, aged paper, stains, a swaying ribbon bookmark, contents page and handwritten
  page numbers.
- **Writing in ink** — every typed character bleeds onto the page; a **40-second ring** starts
  after a name is written, then a red flash, a heartbeat, and the ink sets darker. Ink drips, a
  candle that flickers harder when you type fast, and wind lifting the page when idle.
- **Shinigami presence** — an original silhouette appears behind the book now and then, its eyes
  following your cursor. Whispers fade in at the margins. A hidden **apple** opens a secret page,
  and the **Konami code** unlocks _Shinigami Eyes_.
- **Guests write immediately** (localStorage). **Signed-in users** (e-mail and password)
  sync to PostgreSQL with debounced autosave, a "saved" ink stamp and a one-click import of guest
  notes. Search, edit, delete, export a page as **PNG or PDF**, or share an image with names blurred.
- **The Open Book** — one public notebook everyone can write in, no sign-in needed. Unlimited
  pages (loaded a chapter at a time), autosaved on write, live "new names" updates, pen names,
  page jumps and a random page. Authors can withdraw their own entries.
- **Shared pages** — share any note from your notebook or the Open Book. It gets its own page
  (`/n/<id>`) with a generated preview image and shows up on the home page. Names can be blotted
  out, and a blotted name never reaches the browser. Owners can unshare.
- **Candles & reports** — light a candle for a page (one per person), or report it. Three
  reports from different people hide an item until a moderator reviews it in `/admin`.
- **Privacy & safety** — your own notebook stays private; public content goes through the same
  content guard (threats, slurs, personal data), strict rate limits, and IPs are only ever
  stored as salted hashes.
- **Sponsor with crypto (OxaPay)** — recommended chips and a custom amount, a live "70% goes to
  charity" split, verified webhooks only, a themed return page and an opt-in supporters page.
- **Accessible & fast** — reduced-motion version with fades only, lazy-loaded 3D with an ink
  loading bar, 2D fallback for weak or missing WebGL, keyboard navigation and ARIA labels.
  Lighthouse (desktop): Accessibility 100, Performance 92–99.

## 🧰 Tech Stack

| Layer      | Choice                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript 6 (strict)                                        |
| Styling    | Tailwind CSS 4, self-hosted OFL fonts (UnifrakturCook, IM Fell English, Caveat, Homemade Apple) |
| Animation  | GSAP 3 + ScrollTrigger, Motion (Framer Motion), CSS 3D                                          |
| 3D         | Three.js via @react-three/fiber and @react-three/drei                                           |
| Data       | PostgreSQL 16 + Prisma 7 (driver adapter `@prisma/adapter-pg`)                                  |
| Auth       | Auth.js v5 (e-mail/password with argon2id)                                                      |
| Validation | Zod 4 on the client **and** the server                                                          |
| Sound      | Howler.js playing sounds synthesised at runtime (no audio files)                                |
| Payments   | OxaPay v1 invoices and HMAC-SHA512 callbacks                                                    |
| Tests      | Vitest (unit), Playwright (end-to-end)                                                          |

> Deviations from the original brief: **Auth.js v5** is still published as a beta tag but is the
> App Router-native version; **TypeScript 6** is used instead of 7 because tooling around Next.js
> still relies on the JavaScript compiler API; **Motion** is the current name of Framer Motion.

## 🏛️ Architecture

```mermaid
flowchart LR
  subgraph Browser
    UI[Next.js pages<br/>React 19] --> FX[GSAP · Motion · R3F/Three.js]
    UI --> LS[(localStorage<br/>guest notes)]
    UI --> SND[Howler<br/>synth sounds]
  end

  subgraph Server[Next.js server]
    API[/Route handlers<br/>Zod · CSRF · rate limit/]
    AUTH[Auth.js]
    WH[/OxaPay webhook<br/>HMAC verify · idempotent/]
  end

  DB[(PostgreSQL<br/>Prisma)]
  OXA[OxaPay API]

  UI -- notes, sponsor --> API
  UI -- sign in --> AUTH
  API --> DB
  AUTH --> DB
  API -- create invoice --> OXA
  OXA -- payer pays --> OXA
  OXA -- signed callback --> WH --> DB
  UI -. redirect .-> OXA
  OXA -. return_url .-> UI
```

<details>
<summary><b>Payment flow in detail</b></summary>

1. The modal validates the amount with Zod and calls `POST /api/sponsor`.
2. The server validates again, stores a `sponsorships` row with status `pending`, then calls
   `POST https://api.oxapay.com/v1/payment/invoice` with `amount`, `currency: USD`, `order_id`,
   `callback_url`, `return_url` and a description. The key is sent in the `merchant_api_key` header.
3. The browser is redirected to the returned `payment_url`.
4. OxaPay calls `/api/webhooks/oxapay`. The route verifies the `HMAC` header
   (HMAC-SHA512 of the raw body with the merchant key), stores the delivery in `webhook_events`
   keyed by a SHA-256 of the body (duplicates are ignored), checks the amount, and moves the status
   forward only (`pending → paying → paid`, `paid → refunded`; never backwards).
5. `/sponsor/return` only reads the stored status. **The return URL never marks anything as paid.**

</details>

## 🚀 Getting Started (Windows / PowerShell first)

**Requirements:** Node.js 20.9+ (22 LTS recommended), Docker Desktop, Git.

```powershell
git clone https://github.com/KortzLab/DeathNote.git
cd DeathNote
npm install
```

Start PostgreSQL in Docker:

```powershell
npm run db:up
```

Create your `.env` from the example and fill it in (see the table below):

```powershell
Copy-Item .env.example .env
```

A minimal local `.env`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://deathnote:deathnote@localhost:5432/deathnote?schema=public
AUTH_SECRET=<generate one: npx auth secret>
AUTH_TRUST_HOST=true
```

Run the migrations, seed demo data and start the dev server:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Open <http://localhost:3000>. The seed prints a demo account (`demo@deathnote.local`) with a fresh
random password each time it runs.

> On macOS/Linux the same npm scripts work; use `cp .env.example .env` instead of `Copy-Item`.

<details>
<summary><b>Useful scripts</b></summary>

| Script                                                       | What it does                                     |
| ------------------------------------------------------------ | ------------------------------------------------ |
| `npm run dev`                                                | Development server                               |
| `npm run build` / `npm start`                                | Production build / server                        |
| `npm run lint` · `npm run typecheck` · `npm run format`      | Quality checks                                   |
| `npm test`                                                   | Unit tests (Vitest)                              |
| `npm run test:e2e`                                           | End-to-end tests (Playwright)                    |
| `npm run db:up` / `db:down`                                  | Start / stop Postgres in Docker                  |
| `npm run db:migrate` · `db:deploy` · `db:seed` · `db:studio` | Prisma                                           |
| `npm run webhook:test -- <order_id> [status]`                | Send a signed test callback to your local server |

</details>

## 🔐 Environment Variables

Names and descriptions only. Never commit real values; `.env` is ignored by git.

| Variable                  | Required | Description                                                           |
| ------------------------- | :------: | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    |    ✅    | Public URL of the site, used for callbacks, OG tags and the sitemap   |
| `DATABASE_URL`            |    ✅    | PostgreSQL connection string                                          |
| `AUTH_SECRET`             |    ✅    | Secret used by Auth.js to sign sessions (`npx auth secret`)           |
| `AUTH_TRUST_HOST`         |    ⬜    | `true` when running behind a proxy or on a VPS                        |
| `ADMIN_EMAILS`            |    ⬜    | Comma-separated e-mails that can open `/admin`                        |
| `OXAPAY_ENABLED`          |    ⬜    | `true` to show the sponsor buttons and accept payments                |
| `OXAPAY_MERCHANT_API_KEY` |    ⬜    | OxaPay merchant key (server only, never logged or sent to the client) |

> `OXAPAY_ENABLED` is read when pages are built, so redeploy after
> changing them.

## 🗄️ Database & Migrations

Tables: `users`, `accounts`, `sessions`, `verification_tokens` (Auth.js), `notebooks`, `pages`,
`notes` (soft delete, indexed by owner/page/name), `sponsorships` (amounts in cents, charity share,
status, OxaPay track id), `webhook_events` (idempotency + audit) and `rate_limits`.

```powershell
npm run db:migrate          # create/apply migrations in development
npm run db:deploy           # apply migrations in production
npm run db:seed             # demo data (refuses to run with NODE_ENV=production)
npm run db:studio           # browse the data
```

The schema lives in [`prisma/schema.prisma`](prisma/schema.prisma); configuration in
[`prisma.config.ts`](prisma.config.ts).

## 🧪 Testing

```powershell
npm test            # unit: validation, content guard, amounts, webhook signature, status transitions
npm run test:e2e    # e2e: guest writes → refresh → still there; sponsor modal amount selection
```

The first e2e run needs a browser: `npx playwright install chromium`. The sponsor test runs when
`OXAPAY_ENABLED=true` (no payment is ever created by the tests).

<details>
<summary><b>Testing the OxaPay webhook locally (tunnel)</b></summary>

OxaPay must reach your machine, so expose port 3000 with a tunnel:

```powershell
# Option A: Cloudflare Tunnel (winget install Cloudflare.cloudflared)
cloudflared tunnel --url http://localhost:3000

# Option B: ngrok (winget install ngrok.ngrok)
ngrok http 3000
```

1. Set `NEXT_PUBLIC_SITE_URL` in `.env` to the tunnel URL (for example
   `https://random-words.trycloudflare.com`), set `OXAPAY_ENABLED=true` and
   your `OXAPAY_MERCHANT_API_KEY`, then restart `npm run dev`.
2. Open the sponsor modal through the tunnel URL and create an invoice. The callback URL sent to
   OxaPay is `<NEXT_PUBLIC_SITE_URL>/api/webhooks/oxapay`.
3. Without a real payment, simulate one: copy the `order_id` from `/admin` or Prisma Studio and run

   ```powershell
   npm run webhook:test -- dn_xxxxxxxxxxxxxxxx Paid
   ```

   The script signs the body with your local key exactly like OxaPay does.

</details>

## ☁️ Deployment

<details>
<summary><b>Vercel + managed Postgres (Neon, Supabase, Railway…)</b></summary>

1. Create a Postgres database and copy its connection string.
2. Import the repository in Vercel. Add every variable from the table above in
   _Settings → Environment Variables_ (`NEXT_PUBLIC_SITE_URL` = your production URL).
3. Set the build command to `npx prisma migrate deploy && next build` (or run `npm run db:deploy`
   once from your machine against the production database).
4. Set the OxaPay callback domain in your OxaPay merchant settings if required.
5. Deploy. Visit `/admin` with an e-mail listed in `ADMIN_EMAILS`.

</details>

<details>
<summary><b>VPS (Node 22 + reverse proxy)</b></summary>

```bash
git clone https://github.com/KortzLab/DeathNote.git && cd DeathNote
npm ci
cp .env.example .env   # fill in production values, AUTH_TRUST_HOST=true
npm run db:deploy
npm run build
npm start              # listens on :3000; run it with pm2 or a systemd service
```

Put Caddy or Nginx in front for HTTPS. Keep `.env` readable only by the service user.

</details>

## 🗂️ Project Structure

<details>
<summary><b>Show the tree</b></summary>

```text
.
├── .github/                 # CI, issue/PR templates, funding, README assets
├── prisma/                  # schema, migrations, seed
├── scripts/                 # send-test-webhook.ts
├── src/
│   ├── app/                 # routes (App Router)
│   │   ├── api/             # notes, public, shares, reports, candles, sponsor, webhooks/oxapay, auth
│   │   ├── notebook/        # the private writing experience
│   │   ├── public/          # the Open Book
│   │   ├── n/[id]/          # a shared page and its preview image
│   │   ├── rules/           # scroll-driven rules
│   │   ├── supporters/  sponsor/return/  admin/
│   │   ├── about/  privacy/  terms/  secret/  signin/
│   │   ├── opengraph-image.tsx  sitemap.ts  robots.ts  icon.svg
│   │   └── layout.tsx  globals.css  not-found.tsx
│   ├── components/
│   │   ├── three/           # IntroScene, page-curl material, particles, textures
│   │   ├── intro/           # 3D/2D/calm intro, ink loader
│   │   ├── notebook/        # FlipBook, InkText, CountdownRing, Candle, pages
│   │   ├── fx/              # quill cursor, shinigami, whispers, Konami, apple
│   │   ├── sponsor/         # modal, triggers, return page
│   │   ├── public/          # Open Book, share/report dialogs, paper cards
│   │   ├── home/            # home page feed
│   │   └── layout/ ui/ providers/ rules/ auth/
│   ├── content/rules.ts     # the 18 original rules
│   ├── lib/                 # validation, content guard, oxapay, server helpers, hooks, sound
│   └── auth.ts              # Auth.js configuration
└── tests/                   # unit (Vitest) and e2e (Playwright)
```

</details>

## 🗺️ Roadmap

- [x] 3D intro with falling notebook, ash and page curl
- [x] Ink writing, 40-second ring, guest + account notes
- [x] Scroll-written rules, easter eggs, procedural sound
- [x] OxaPay sponsorships with verified webhooks
- [ ] Second language for the rules (structure ready)
- [ ] Recorded GIFs for the README
- [ ] Account deletion from the UI
- [ ] More notebook covers and paper styles
- [x] Public Open Book and shareable pages with candles, reports and moderation

## 🤝 Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). Security issues go through [SECURITY.md](SECURITY.md), not
public issues.

## 🍎 Sponsor

This site is free. If it made your day a little darker (in a good way), consider a small
contribution through the sponsor button on the site.

**From this sponsor amount, 70% will go to charity.**

## 📜 License

[MIT](LICENSE) © h4sib.pro. The license covers this project's original code and assets.
"Death Note" is a trademark of its respective owners.

## ⚠️ Disclaimer

Unofficial fan project. Not affiliated with the creators or publishers of Death Note. No official
artwork, logos, characters, fonts or rule text are used. For fiction and fun only. Don't use this
to threaten or harass real people.

---

<div align="center">

**Built by [h4sib.pro](https://h4sib.pro) · Powered by [kortzlab.pro](https://kortzlab.pro)**

</div>
