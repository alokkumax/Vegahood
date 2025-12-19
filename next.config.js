/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pjvmnzcemwnlqtetcrhu.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig

