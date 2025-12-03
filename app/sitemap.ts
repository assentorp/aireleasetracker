import { MetadataRoute } from 'next';
import { timelineData } from '@/lib/timeline-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aireleasetracker.com';

  // Main pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Add all model detail pages
  timelineData.forEach((company) => {
    company.releases.forEach((release) => {
      const modelSlug = release.name.toLowerCase().replace(/\s+/g, '-');

      // Parse release date for lastModified
      const parseReleaseDate = (dateStr: string): Date => {
        const parts = dateStr.split(' ');
        const monthMap: { [key: string]: number } = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        if (parts.length === 3) {
          const month = monthMap[parts[0]] || 0;
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          return new Date(year, month, day);
        } else if (parts.length === 2) {
          const month = monthMap[parts[0]] || 0;
          const year = parseInt(parts[1]);
          return new Date(year, month, 1);
        }
        return new Date();
      };

      const releaseDate = parseReleaseDate(release.date);

      routes.push({
        url: `${baseUrl}/model/${company.company}/${modelSlug}`,
        lastModified: releaseDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  });

  // Add company-specific pages if needed in the future
  // For now, we just have the main timeline and individual model pages

  return routes;
}
