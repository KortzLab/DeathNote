# Security Policy

## Supported versions

Only the latest version on the `main` branch (and the live site) receives security fixes.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Report privately through one of these channels:

1. GitHub's **[private vulnerability reporting](https://github.com/KortzLab/DeathNote/security/advisories/new)**
   (Security tab → "Report a vulnerability"), or
2. A direct message on Discord to **kirawth**, or via the contact options on [h4sib.pro](https://h4sib.pro).

Please include:

- A description of the issue and its impact
- Steps to reproduce (a proof of concept if possible)
- Affected URL, route or file

You can expect an acknowledgement within **72 hours** and a status update within **7 days**.
Please give us reasonable time to fix the issue before any public disclosure. We are happy to
credit you in the changelog unless you prefer to stay anonymous.

## Scope

In scope: authentication, note privacy (accessing someone else's notes), payment and webhook
handling (OxaPay), XSS/CSRF/injection, secret exposure.

Out of scope: denial of service through volume, social engineering, issues in third-party services.

## Handling secrets

- Never commit `.env` files. `OXAPAY_MERCHANT_API_KEY` and `AUTH_SECRET` live only in
  the server environment.
- If you find a leaked secret in the history, report it privately so it can be rotated.
