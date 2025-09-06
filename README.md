<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🛒 Forever Full-Stack E-Commerce</h1>
        <div class="muted">A production-style MERN e-commerce app with separate frontend (customer), backend (API), and admin panel — product management, cart, orders and authentication.</div>
      </div>
    </header>
    <section class="cols">
      <div class="card">
        <h2>🚀 Tech Stack</h2>
        <ul>
          <li>Frontend: React (Vite), TailwindCSS</li>
          <li>Backend: Node.js, Express, MongoDB</li>
          <li>Auth: JWT + HTTP-only cookies</li>
          <li>Others: Axios, Cloudinary, Stripe (future)</li>
        </ul>
        <h2 style="margin-top:12px">📂 Project Structure</h2>
        <pre>forever-full-stack-main/
├─ backend/    # Express API, routes, DB
├─ frontend/   # React customer app
├─ admin/      # React admin dashboard
├─ .gitignore
└─ README.md</pre>
      </div>
      <div class="card">
        <h2>⚡ Highlights</h2>
        <ul>
          <li>Secure authentication & protected routes</li>
          <li>Product listing with filters & search</li>
          <li>Persistent cart, quantity management & checkout flow</li>
          <li>Admin dashboard for product & order management</li>
        </ul>
        <h2 style="margin-top:12px">🎯 Features</h2>
        <ul>
          <li>CRUD for products & image uploads (Cloudinary)</li>
          <li>RESTful API design and error handling</li>
          <li>Responsive UI and client-side state management</li>
        </ul>
      </div>
    </section>
    <section>
      <h2>🔧 Installation & Local Setup</h2>
      <ol>
        <li><strong>Clone repository</strong>
          <pre>git clone https://github.com/your-username/forever-full-stack-main.git
cd forever-full-stack-main</pre>
        </li>
        <li><strong>Backend</strong>
          <pre>cd backend
npm install
# create backend/.env (see below)
npm run dev</pre>
        </li>
        <li><strong>Frontend</strong>
          <pre>cd ../frontend
npm install
# create frontend/.env (Vite)
npm run dev</pre>
        </li>
        <li><strong>Admin panel</strong>
          <pre>cd ../admin
npm install
# create admin/.env (Vite)
npm run dev</pre>
        </li>
      </ol>
    </section>
    <section class="cols" style="margin-top:16px">
      <div class="card">
        <h2>🧾 Environment Variables</h2>
        <strong>backend/.env</strong>
        <pre>MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000</pre>
        <strong style="margin-top:8px">frontend/.env (Vite)</strong>
        <pre>VITE_BACKEND_URL=http://localhost:5000</pre>
        <strong style="margin-top:8px">admin/.env (Vite)</strong>
        <pre>VITE_BACKEND_URL=http://localhost:5000</pre>
      </div>
      <div class="card">
        <h2>📌 Notes & Troubleshooting</h2>
        <ul>
          <li>Ensure backend CORS allows the frontend origin and uses <code>credentials: true</code> when sending cookies.</li>
          <li>For cross-origin cookies during dev use <code>sameSite: "None"</code> with <code>secure: false</code> (enable secure in production over HTTPS).</li>
          <li>Do not commit any <code>.env</code> files — they are ignored by <code>*.env</code> in <code>.gitignore</code>.</li>
        </ul>
        <h2 style="margin-top:12px">🔭 Advance Work</h2>
        <ul>
          <li>Payment integration (Stripe / Razorpay)</li>
          <li>Product reviews & ratings</li>
          <li>Dockerize & add CI/CD pipeline</li>
        </ul>
      </div>
    </section>
    <section style="margin-top:18px">
      <h2>📬 Author</h2>
      <div class="muted">Pranshu Shukla — <a href="https://github.com/Pranshu-007" target="_blank">GitHub</a> • <a href="https://www.linkedin.com/in/pranshu-shukla" target="_blank">LinkedIn</a></div>
    </section>
    <footer style="margin-top:18px">
      <div>Repository: <a href="https://github.com/your-username/forever-full-stack-main" target="_blank">forever-full-stack-main</a></div>
      <div class="muted">Made with MERN • ©</div>
    </footer>
  </div>
</body>
</html>
