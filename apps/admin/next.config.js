/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker / self-hosted deployments.
  // Vercel ignores this and handles it natively.
  output: "standalone",
  transpilePackages: ["@coolcliq/shared"],

  // Expose runtime env vars to the browser bundle.
  // On Vercel, set these in Project → Settings → Environment Variables.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

export default nextConfig;
