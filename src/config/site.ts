export const siteConfig = {
  title: "en 的个人随笔",
  shortTitle: "en",
  subtitle: "记录 AI、创作与生活里的微光",
  description:
    "en 的个人博客，记录 AI 学习、内容创作、工具实践与日常思考。",
  author: "en",
  locale: "zh-CN",
  timezone: "Asia/Shanghai",
  avatar: "/images/avatar-en.svg",
  heroImage: "/images/hero-atmosphere.svg",
  startDate: "2026-11-12",
  url: "https://en-blog.example.com",
  profile: {
    name: "en",
    role: "AI 学习者 · 内容创作者",
    bio: "在持续学习中搭建自己的知识体系，也用文字记录每一次真实的探索。",
  },
  social: [
    {
      label: "GitHub",
      href: "https://github.com/",
      external: true,
    },
    {
      label: "邮箱",
      href: "mailto:hello@example.com",
      external: false,
    },
  ],
} as const;

export const navigation = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts/" },
  { label: "归档", href: "/archive/" },
  { label: "标签", href: "/tags/" },
  { label: "关于", href: "/about/" },
] as const;
