/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required so server-side Twilio/OpenAI calls aren't bundled for the browser
  experimental: {
    serverComponentsExternalPackages: ['twilio', 'openai'],
  },
};

module.exports = nextConfig;
