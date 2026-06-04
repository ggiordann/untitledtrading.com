/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.untitledtrading.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/play', '/projects'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/_next/*', '/node_modules/*', '/play', '/projects'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://www.untitledtrading.com/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Set custom priority for different pages
    let priority = 0.7;
    let changefreq = 'monthly';
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'weekly';
    } else if (path === '/about') {
      priority = 0.9;
      changefreq = 'monthly';
    } else if (path === '/careers') {
      priority = 0.85;
      changefreq = 'weekly';
    } else if (path === '/manifesto') {
      priority = 0.85;
      changefreq = 'monthly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};