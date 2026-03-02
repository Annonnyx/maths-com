/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://maths-app.com',
  additionalSitemaps: [
    {
      siteUrl: 'https://www.maths-app.fr',
      sitemapFileName: 'sitemap-fr.xml'
    }
  ],
  generateRobotsTxt: false, // Nous avons déjà notre propre robots.txt
  changefreq: 'daily',
  priority: 1.0,
  sitemapSize: 7000,
  generateIndexSitemap: true,
  exclude: ['/server-sitemap.xml'],
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
    
    if (path.includes('/dashboard') || path.includes('/profile')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }

    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    
    // Pages statiques importantes
    const staticPages = [
      { url: '/login', changefreq: 'monthly', priority: 0.6 },
      { url: '/register', changefreq: 'monthly', priority: 0.6 },
      { url: '/courses', changefreq: 'weekly', priority: 0.9 },
      { url: '/leaderboard', changefreq: 'daily', priority: 0.8 },
      { url: '/test', changefreq: 'weekly', priority: 0.8 },
      { url: '/practice', changefreq: 'weekly', priority: 0.8 },
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
