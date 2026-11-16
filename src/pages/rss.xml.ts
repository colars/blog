import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { siteConfig } from "../config/site";
import { getPostPath, getPublishedPosts } from "../utils/content";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: getPostPath(post),
      categories: post.data.tags,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
