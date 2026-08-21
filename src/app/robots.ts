import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/tienda/'],
      disallow: ['/admin/', '/internal/', '/api/', '/auth/', '/login'],
    },
    sitemap: 'https://www.voltastore.app/sitemap.xml',
  }
}
