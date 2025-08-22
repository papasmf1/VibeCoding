/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPABASE_URL: 'https://xaoqgesgodxopccfkqvj.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb3FnZXNnb2R4b3BjY2ZrcXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTY4MTgsImV4cCI6MjA3MTI5MjgxOH0.CQiQlUFUuBI-xdEew5x5lqRazG1fLvqDj_1hiL1-lfs'
  },
  images: {
    domains: ['images.unsplash.com'],
  }
}

module.exports = nextConfig
