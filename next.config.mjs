import createNextIntlPlugin from 'next-intl/plugin';

// Create the Next.js Intl plugin with correct configuration
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Try to import user config if it exists
let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode as per map project
  reactStrictMode: false,
  
  // Both projects ignore TypeScript and ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Combine image configurations
  images: {
    domains: ["via.placeholder.com"],
    unoptimized: true,
  },
  
  // Experimental features from epd-builder
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
  },
  
  // Webpack config to handle punycode deprecation
  webpack: (config, { isServer }) => {
    // Handle punycode deprecation
    config.resolve.fallback = {
      ...config.resolve.fallback,
      punycode: false,
    };
    
    return config;
  },
  
  // IMPORTANT: The 'export' setting is for static site generation
  // Uncomment this if you want a static site without server features
  // output: 'export',
};

// Merge with user config if available
function mergeConfig(baseConfig, userConfig) {
  if (!userConfig) return baseConfig;
  const { default: config } = userConfig;
  return {
    ...baseConfig,
    ...config,
  };
}

const mergedConfig = mergeConfig(nextConfig, userConfig);

// Apply next-intl plugin and export
export default withNextIntl(mergedConfig);
