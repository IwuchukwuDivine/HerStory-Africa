import { queryCollection } from "@nuxt/content/server";

const SITE_URL = "https://herstoryafrica.com.ng";
const SITE_TITLE = "HerStory Africa";
const SITE_DESC =
  "The women history forgot to teach you. An educational archive of African women who fought for equality, rights, and social change.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default defineEventHandler(async (event) => {
  const articles = await queryCollection(event, "articles")
    .order("date", "DESC")
    .all();

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/articles/${a.slug}`;
      const pubDate = new Date(`${a.date}T00:00:00+00:00`).toUTCString();
      const image = a.image ? `${SITE_URL}${a.image}` : "";
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.description ?? "")}</description>${
        a.category ? `\n      <category>${escapeXml(a.category)}</category>` : ""
      }${
        image
          ? `\n      <enclosure url="${image}" type="image/jpeg" />`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const lastBuild = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  setHeader(event, "content-type", "application/rss+xml; charset=utf-8");
  return xml;
});
