/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de production optimisée
  reactStrictMode: true,
  
  // Optimisation des images
  images: {
    domains: ['localhost', 'ton-domaine.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
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
  
  // Variables d'environnement exposées au client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Turbopack config (vide pour utiliser les défauts Next.js 16)
  turbopack: {},
  
  // Configuration pour le déploiement
  output: 'standalone',
  
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
