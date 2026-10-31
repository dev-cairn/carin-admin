# 🧭 Cairn Sovereign Admin Dashboard

Centralized triage, telemetry analysis, and management portal for **Cairn Browser** feedback submissions.

## 🚀 Quick Setup & Local Development

1. Open a terminal and navigate to the `admin` directory:
   ```bash
   cd admin
   npm install
   npm run dev
   ```
2. The dashboard will launch at `http://localhost:3000`.

---

## 🔒 Firebase Cloud Console Prerequisites

For the admin panel to receive live data from Cairn Browser:

1. **Enable Cloud Firestore Database:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/cairn-browser/firestore).
   - Click **Create Database**.
   - Choose location (e.g. `asia-southeast1` or `nam5`) and start in **Production mode**.

2. **Paste Security Rules:**
   - Go to the **Rules** tab in Firestore.
   - Copy & paste the contents of [`admin/firestore.rules`](./firestore.rules) and click **Publish**.

3. **Enable Firebase Authentication:**
   - Go to [Firebase Auth Console](https://console.firebase.google.com/project/cairn-browser/authentication).
   - Click **Get Started**.
   - Under Sign-in method, enable **Email/Password** and **Google**.
   - Under the **Users** tab, click **Add User** and create your admin account (email + password).

---

## ☁️ Deployment to Vercel

1. Push your repository to GitHub.
2. In your [Vercel Dashboard](https://vercel.com/new), import the repository.
3. In **Project Settings**:
   - Set **Root Directory** to `admin`.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
4. Click **Deploy**. Your live admin portal is now accessible from any browser anywhere!
