import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "../config/site";

export type Post = CollectionEntry<"posts">;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);

  return posts.sort((a, b) => {
    const featuredDifference =
      Number(b.data.featured) - Number(a.data.featured);

    if (featuredDifference !== 0) {
      return featuredDifference;
    }

    return b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
  });
}

export function getPostPath(post: Post): string {
  const slug = post.id.replace(/\.(md|mdx)$/, "");
  return `/posts/${slug}/`;
}

export function getPostSlug(post: Post): string {
  return post.id.replace(/\.(md|mdx)$/, "");
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: siteConfig.timezone,
  })
    .format(date)
    .replaceAll("/", "-");
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: siteConfig.timezone,
  }).format(date);
}

export function getReadingTime(body = ""): number {
  const cjkCharacters = body.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords =
    body
      .replace(/[\u3400-\u9fff]/g, " ")
      .match(/[a-zA-Z0-9_]+/g)?.length ?? 0;
  const minutes = Math.ceil((cjkCharacters + latinWords * 2) / 350);

  return Math.max(1, minutes);
}

export function tagToSlug(tag: string): string {
  return tag.trim().toLowerCase().replaceAll(" ", "-");
}

export function slugToTag(slug: string): string {
  return slug.replaceAll("-", " ");
}

export function categoryToSlug(category: string): string {
  return category.trim().toLowerCase().replaceAll(" ", "-");
}

export function slugToCategory(slug: string): string {
  return slug.replaceAll("-", " ");
}

export function getAllTags(posts: Post[]): Map<string, number> {
  const tags = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }

  return new Map(
    [...tags.entries()].sort(
      ([tagA, countA], [tagB, countB]) =>
        countB - countA || tagA.localeCompare(tagB, "zh-CN"),
    ),
  );
}

export function getAllCategories(posts: Post[]): Map<string, number> {
  const categories = new Map<string, number>();

  for (const post of posts) {
    const category = post.data.category;
    categories.set(category, (categories.get(category) ?? 0) + 1);
  }

  return new Map(
    [...categories.entries()].sort(
      ([categoryA, countA], [categoryB, countB]) =>
        countB - countA || categoryA.localeCompare(categoryB, "zh-CN"),
    ),
  );
}
