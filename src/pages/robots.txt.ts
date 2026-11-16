import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://en-blog.example.com");
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL("sitemap-index.xml", baseUrl).toString()}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
