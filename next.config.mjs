/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // `standalone` emits .next/standalone: a minimal server plus only the
  // node_modules the app actually reaches. That is what the Dockerfile ships.
  //
  // Gated behind DOCKER_BUILD on purpose — Vercel remains the primary deploy
  // target and does not need standalone output. The Dockerfile sets
  // DOCKER_BUILD=1; nothing else does, so `npm run build` locally and on
  // Vercel behaves exactly as before.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
}

export default nextConfig
