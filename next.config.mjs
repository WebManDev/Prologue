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
  // Prevent prerendering of Firebase-dependent pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Optional: Add trailingSlash for better compatibility
  trailingSlash: false,
}

export default nextConfig