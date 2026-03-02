/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de production optimisée
  reactStrictMode: true,
  
  // Optimisation des images
  images: {
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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
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
  
  // Configuration webpack pour exclure Prisma du client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Exclure explicitement Prisma du bundle client
      config.externals = {
        ...config.externals,
        '@prisma/client': 'prisma',
        'prisma': 'prisma',
        '.prisma/client': 'prisma',
      };
      
      // Exclure les fichiers Prisma du bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
        'prisma': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
