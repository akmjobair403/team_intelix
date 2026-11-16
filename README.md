# TEAM INTELIX — secure portfolio & admin CMS

A responsive two-page portfolio with a server-backed admin console. The visual design, member spotlight, projects, FAQs, contact routing and admin editing experience are retained. The admin login is now verified on the server; credentials are never embedded in browser JavaScript or HTML.

## Requirements

- Node.js 18 or newer
- Linux, macOS, Windows, or a Node-compatible hosting provider

No third-party npm packages are required.

## Run locally (Linux)

```bash
cd spider-bite-portfolio
chmod +x setup-admin.sh
./setup-admin.sh
npm start
```

The setup script asks you to create your own admin username and password, generates a random session-signing secret, and writes them to a private `.env` file. The password must be at least 14 characters. `.env` is excluded by `.gitignore`.

Open:
- Public website: http://localhost:8000/
- Admin console: http://localhost:8000/admin.html

To stop the server, press `Ctrl + C`.

## What changed for security

- Removed the hard-coded demo username/password from `app.js`, `admin.html` and the public source.
- Server-side login checks credentials from environment variables only.
- Admin session is an 8-hour, signed, `HttpOnly`, `SameSite=Strict` cookie; browser JavaScript cannot read it.
- Admin write requests are authorized by the server. Hiding the dashboard in the browser is not the security boundary.
- Login attempts are rate-limited; password comparisons use constant-time comparison.
- Server validates request origin for login and write operations and applies basic security headers.
- Logout clears the session cookie.
- Public visitors can read published content, but only an authenticated admin can change it.

## Deploying

1. Push the project files to your hosting provider. **Do not upload or commit `.env`.**
2. Set the start command to `npm start` (or `node server.js`).
3. Configure these environment variables in the host's private environment/secrets settings:
   - `ADMIN_USERNAME`: your chosen private admin username
   - `ADMIN_PASSWORD`: a unique password of at least 14 characters
   - `SESSION_SECRET`: a random secret of at least 32 characters (for example, generate with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`)
   - `NODE_ENV=production`
   - `PORT`: usually supplied automatically by the host
4. Use HTTPS. The server marks the session cookie `Secure` in production.
5. Attach a **persistent disk/volume** for the `content.json` file, or migrate storage to a managed database before using an ephemeral or multi-instance hosting setup. The JSON file is suitable for a single server instance with persistent storage, not horizontal scaling or concurrent multi-instance writes.

If your hosting provider only supports static hosting (for example, a static site bucket), this server cannot run there by itself. Deploy to a Node.js-capable service or use a managed backend such as Supabase/Firebase with server-side authorization.

## Content and data

The admin panel manages team members, projects, FAQs and the contact destination. Changes are written to `content.json` on the server and are visible to every visitor. Existing starter content is in `content.json`; replace it with your real team information before launch. Uploaded images are resized and stored as image data in the content file, so keep image sizes sensible.

Back up `content.json` and keep `.env` private. If credentials are exposed, rotate them immediately and change `SESSION_SECRET` to invalidate existing sessions.

## Important security note

This is a compact single-server CMS foundation, not a substitute for a security review. Use a strong unique password, HTTPS, protected environment variables, backups and persistent storage. For a larger production deployment, use a managed database/object storage and a mature identity provider with MFA.

## Existing design refinements

- Black, white and graphite glassmorphism styling with subtle 3D depth.
- Team spotlight loads the first member immediately and cycles in the exact admin roster order, looping to the first member.
- FAQ question and answer typewriter interaction.
- Public projects, team members and FAQs load from the server's shared content store.
