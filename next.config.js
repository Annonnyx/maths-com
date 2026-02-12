/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'ton-domaine.com',
      },
    ],
  },
  
  // Base path pour GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/maths-com' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/maths-com' : '',
  
  // Turbopack config
  turbopack: {},
  
  // Variables d'environnement exposées au client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Compression Gzip
  compress: true,
  
  // Configuration pour les publicités
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  // Exclure les routes API du build statique
  excludeDefaultMomentLocales: true,
};

module.exports = nextConfig;
