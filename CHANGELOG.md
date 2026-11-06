# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Monochrome gothic theme closer to the anime's look: cold black-and-white palette, stark white
  engraved title on a black cover, white-on-black "How to use it" rule pages, cathedral windows
  with light shafts, cold rain and film grain; red is reserved for apples, shinigami eyes,
  Shinigami Eyes mode and the final seconds of the countdown

## [0.1.0] - 2026-11-06

### Added

- Next.js App Router scaffold with strict TypeScript, Tailwind CSS 4, ESLint and Prettier
- PostgreSQL schema (users, notebooks, pages, notes, sponsorships, webhook events, rate limits) with Prisma migrations and a dev seed
- Auth.js sign-in with e-mail/password (argon2id)
- Security headers, Content Security Policy, same-origin CSRF checks and a Postgres-backed rate limiter
- WebGL intro: falling notebook, ash and embers, camera shake, dust burst, cursor tilt, ember-lit title, heavy cover hinge and curling 3D pages
- 2D CSS fallback for weak or missing WebGL and a fade-only reduced-motion version
- Page-flip notebook with ink-bleed handwriting, 40-second countdown ring, sealing flash and heartbeat
- Guest notes in localStorage, account sync with autosave, guest import, search, edit, delete, PNG/PDF export and image sharing with blurred names
- Content guard for threats, slurs and personal data
- Eighteen original rules, scroll-written with GSAP ScrollTrigger and shown inside the book
- Quill cursor, shinigami silhouette, margin whispers, hidden apple with secret page, Konami "Shinigami Eyes" mode
- Procedural sound effects with a remembered mute toggle (muted by default)
- OxaPay sponsorships: modal with recommended and custom amounts, live 70% charity split, HMAC-verified idempotent webhook, themed return page, opt-in supporters page and admin ledger
- About, Privacy, Terms, custom 404, sitemap, robots, Open Graph image and favicon
- Unit tests (Vitest) and end-to-end tests (Playwright), CI workflow and community health files
