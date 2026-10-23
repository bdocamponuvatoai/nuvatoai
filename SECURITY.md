# Security

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Report privately through GitHub: on the repository's **Security** tab, choose **Report a vulnerability**. If that isn't available, email **legal@nuvato.ai** with "Security" in the subject line.

Please include:

- what is affected (a URL, an API route, or a file),
- steps to reproduce it, and
- the impact you believe it has.

Only the production site (`main`) is supported. Please don't access other people's data, disrupt the service, or create real bookings while testing.

## How the site is protected

The full security model is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#security-model). In short:

- A strict Content-Security-Policy with a per-request nonce, plus HSTS, frame denial, and a locked-down Permissions-Policy.
- Booking runs in an embedded Calendly frame. The site holds no credentials and stores no visitor data, and it trusts booking messages only from `https://calendly.com`.
- No cookies, analytics, or third-party scripts. Visitor details are never stored by this site.
- Dependencies are audited in CI, new releases are held for 7 days, and only allowlisted packages may run install scripts.

## Rules for contributors

### Secrets

- **Never commit secrets:** API keys, tokens, passwords, private keys, or `.env` files. `.gitignore` excludes every `.env*` file except `.env.example`, which must contain only empty placeholders and public values.
- The site currently needs no credentials. If one is ever added, store it in Vercel environment variables with type **Secret**, read it only in server code, and never commit it.
- Never put a credential in a `NEXT_PUBLIC_` variable: those are embedded in the JavaScript every visitor downloads.
- Never paste secrets into issues, pull requests, chat tools, or AI assistants.

### If a secret is exposed

Act in this order, because deleting a commit does not make a secret safe: it may already be copied.

1. **Revoke or rotate it immediately** with the provider (Calendly, ImageKit, Vercel, GitHub).
2. Update the new value in Vercel and redeploy.
3. Remove it from the code, and ask the repository owner whether the git history also needs rewriting.
4. Check the provider's logs for use of the old credential.

### Changing security-sensitive code

Pull requests that touch these need extra care in review:

| Area                                  | Files                                       |
| ------------------------------------- | ------------------------------------------- |
| CSP and security headers              | `lib/security.ts`, `proxy.ts`, `next.config.ts` |
| Calendly embed and booking messages   | `lib/calendly.ts`, `components/home/Booking.tsx` |
| Environment and indexing              | `lib/env.ts`                                |
| CI and dependency policy              | `.github/`, `pnpm-workspace.yaml`, `package.json` |

Never loosen the CSP with `'unsafe-inline'` scripts or wildcard sources. Allow the specific origin and directive that is needed.

## Repository settings checklist

For the repository owner (GitHub → Settings). These can't be set from code:

- [ ] **Branch protection on `main`:** require a pull request, one approving review from a code owner, and the **CI** check to pass; block force pushes.
- [ ] **Code security:** enable Dependabot alerts and security updates, secret scanning, **push protection**, and private vulnerability reporting.
- [ ] **Actions:** set the default `GITHUB_TOKEN` permission to read-only.
- [ ] **Accounts:** require two-factor authentication for everyone with write access.
- [ ] **Visibility:** decide whether the repository should be public. The code is marked proprietary.
