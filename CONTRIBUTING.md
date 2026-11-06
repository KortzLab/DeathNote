# Contributing to Death Note

Thanks for wanting to leave a mark in the notebook. Contributions of all sizes are welcome:
bug fixes, accessibility improvements, new animations, translations of the rules and docs.

## Ground rules

- Be kind. This project follows the [Code of Conduct](CODE_OF_CONDUCT.md).
- **No official artwork, logos, character art or fonts** from Death Note. Everything visual must be original or properly licensed (SIL OFL, MIT, CC0…).
- **Never commit secrets.** `.env` is ignored; only `.env.example` (with empty values) belongs in git.
- Keep the experience usable: respect `prefers-reduced-motion`, keyboard navigation and contrast.

## Getting set up

See **Getting Started** in the [README](README.md). Windows (PowerShell) is a first-class platform:
every script is an npm script, no bash required.

## Workflow

1. Fork the repo and create a topic branch from `main`.
2. Make your change. Add or update tests where it makes sense.
3. Run the checks locally:

   ```powershell
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

4. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages,
   for example `feat: add ink splatter to sealed names` or `fix: keep ribbon inside the page`.
5. Open a pull request using the template and describe what changed and how you tested it.
   Screen recordings are very welcome for animation changes.

## Code style

- TypeScript strict mode. Avoid `any`; if it is truly needed, explain why in a comment.
- Prettier formats the code (`npm run format`). ESLint must pass.
- Validate every input on the server with Zod, even if the client already does.
- Keep animations at 60 fps on a mid-range laptop. Profile before adding heavy effects.

## Reporting security issues

Please do **not** open a public issue. Follow [SECURITY.md](SECURITY.md).
