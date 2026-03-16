/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.maths-app.fr',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 1.0,
  sitemapSize: 5000,
  generateIndexSitemap: true,
  exclude: [
    '/api/*',
    '/admin/*',
    '/dashboard*',
    '/profile*',
    '/login',
    '/register',
    '/settings',
    '/notifications',
    '/friends',
    '/messages',
    '/history',
    '/class-*',
    '/discord/*',
    '/onboarding/*',
    '/assignment-*',
    '/take-assignment/*',
    '/server-sitemap.xml'
  ],
  transform: async (config, path) => {
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }
    
    if (path.includes('/courses') || path.includes('/test') || path.includes('/practice')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
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
};
