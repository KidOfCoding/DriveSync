# Deploying to Vercel

Since you are using **Next.js**, Vercel is the best place to deploy. Here is how to do it while keeping your Authentication and Database connections intact.

## 1. Prepare your Repository
Ensure your code is pushed to a GitHub repository.
- Your `.gitignore` is already set up correctly (we fixed it earlier), so your secrets (in `.env.local`) will **NOT** be uploaded to GitHub. This is good and secure.

## 2. Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.

## 3. Configure Environment Variables (CRITICAL)
This is the step that ensures your Auth and Database work.

1. On the "Configure Project" screen in Vercel, look for the **"Environment Variables"** section.
2. Open your local `.env.local` file on your computer.
3. Copy **EVERY** key-value pair from your local file and add them to Vercel.
   - **Key**: The name (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - **Value**: The code (e.g., `pk_test_...`)
4. You can copy-paste the entire file content into the first box, and Vercel is smart enough to parse them all at once!

## 4. Build Settings (Note on `dist`)
Your project is configured to output to a `dist` folder (in `next.config.js`).
- Vercel usually detects Next.js automatically.
- **If the deployment fails** or you get a 404, go to **Settings > Build & Development** in Vercel and change the **Output Directory** to `dist`.
- However, usually Vercel reads your `next.config.js` and handles this automatically.

## 5. Deploy
Click **"Deploy"**. Vercel will build your site.

## 6. Post-Deployment (Auth Configuration)
Since your domain has changed (from `localhost:3000` to `your-app.vercel.app`), you need to update your Auth provider (Clerk).

1. Go to your **Clerk Dashboard**.
2. Go to **API Keys** or **Domains**.
3. Add your new Vercel domain (e.g., `https://real-time-ride-sharing.vercel.app`) to the allowed domains / redirect URLs.
   - For Clerk, it usually works automatically if you are using their Development keys, but for Production, you will need to create a "Production Instance" in Clerk and get NEW keys.
   - **Recommendation**: For now, just deploy. If Auth fails, check your Clerk "Allowed Origins" or create a Production instance in Clerk and update the Environment Variables in Vercel with the new Production keys.
