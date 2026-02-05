import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const URL = "https://www.guardmarketcrash.com";
  return [
    {
      url: URL,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${URL}/about`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/contact`,
      lastModified: new Date(),
      priority: 0.5,
    },
  ];
}
