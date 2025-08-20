British Hosting – Backend
========================
1) Rename .env.example to .env and fill:
   - STRIPE_SECRET_KEY=sk_live_... (or test key)
   - FRONTEND_URL=https://<your-frontend-domain>
   - PORT=3001 (or any)
2) Install & run:
   npm install
   node server.js
3) Deploy free (suggested): Render.com (Web Service) or Glitch.
   Then paste the deployed URL into the frontend .env as VITE_BACKEND_URL.
