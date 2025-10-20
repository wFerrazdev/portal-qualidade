/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
  },
};

module.exports = nextConfig;
