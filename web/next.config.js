import('next').NextConfig
const nextConfig = {
  reactStrictMode: true,
   // Add this to fix the cross-origin warning
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.7.3'],
  
}

module.exports = nextConfig