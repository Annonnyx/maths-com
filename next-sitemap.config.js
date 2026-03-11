/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://maths-app.com',
  generateRobotsTxt: true, // Générer aussi robots.txt
  changefreq: 'daily',
  priority: 1.0,
  sitemapSize: 5000, // Limite raisonnable
  generateIndexSitemap: true,
  exclude: [
    '/api/*', // Exclure les routes API
    '/admin/*', // Exclure les pages admin
    '/dashboard*', // Exclure tout ce qui commence par dashboard
    '/profile*', // Exclure tout ce qui commence par profile
    '/login', // Exclure login (pas utile pour SEO)
    '/register', // Exclure register (pas utile pour SEO)
    '/settings', // Exclure settings (privé)
    '/notifications', // Exclure notifications (privé)
    '/friends', // Exclure friends (privé)
    '/messages', // Exclure messages (privé)
    '/history', // Exclure history (privé)
    '/class-*', // Exclure les pages de gestion de classe
    '/discord/*', // Exclure les pages Discord
    '/onboarding/*', // Exclure onboarding
    '/assignment-*', // Exclure les assignments
    '/take-assignment/*', // Exclure les assignments
    '/server-sitemap.xml'
  ],
  transform: async (config, path) => {
    // Priorité plus élevée pour les pages importantes
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }
    
    // Pages éducatives importantes
    if (path.includes('/courses') || path.includes('/test') || path.includes('/practice')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Classement et pages communautaires
    if (path.includes('/leaderboard') || path.includes('/social')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Pages publiques moins prioritaires
    if (path.includes('/cgu') || path.includes('/confidentialite') || path.includes('/mentions-legales')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      };
    }

    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    
    // Pages statiques importantes à inclure manuellement
    const staticPages = [
      { url: '/courses', changefreq: 'weekly', priority: 0.9 },
      { url: '/leaderboard', changefreq: 'daily', priority: 0.8 },
      { url: '/test', changefreq: 'weekly', priority: 0.8 },
      { url: '/practice', changefreq: 'weekly', priority: 0.8 },
      { url: '/social', changefreq: 'daily', priority: 0.7 },
      { url: '/multiplayer', changefreq: 'weekly', priority: 0.7 },
      { url: '/cgu', changefreq: 'monthly', priority: 0.3 },
      { url: '/confidentialite', changefreq: 'monthly', priority: 0.3 },
      { url: '/mentions-legales', changefreq: 'monthly', priority: 0.3 },
      { url: '/cookies', changefreq: 'monthly', priority: 0.3 },
      { url: '/mineurs', changefreq: 'monthly', priority: 0.3 },
      { url: '/transferts-donnees', changefreq: 'monthly', priority: 0.3 },
    ];

    for (const page of staticPages) {
      result.push({
        loc: page.url,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString(),
      });
    }

    return result;
  },
};
