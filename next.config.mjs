/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // `standalone` emits .next/standalone: a minimal server plus only the
  // node_modules the app actually reaches. That is what the Dockerfile ships.
  //
  // The Dockerfile sets DOCKER_BUILD=1 for the VPS image. Local builds
  // keep the standard output; Vercel Git deployment is disabled in vercel.json.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
}

export default nextConfig
