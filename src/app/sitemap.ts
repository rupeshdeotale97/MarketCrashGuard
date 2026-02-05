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
      url: `${URL}/admin`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/admin/dashboard`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/checklist`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/history`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/live`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/playbooks`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/scanner`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${URL}/settings`,
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}
