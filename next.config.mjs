/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  // Optional: Add trailingSlash for better compatibility
  trailingSlash: false,
}

export default nextConfig