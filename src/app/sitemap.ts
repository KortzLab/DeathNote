import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<[string, number]> = [
    ["/", 1],
    ["/notebook", 0.9],
    ["/rules", 0.9],
    ["/supporters", 0.6],
    ["/about", 0.5],
    ["/privacy", 0.3],
    ["/terms", 0.3],
  ];
  return routes.map(([path, priority]) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
