import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
};

export const getAllPosts = (): BlogPost[] => {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(".md", "");
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || "",
      tags: (data.tags as string[]) || [],
      content,
    };
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
};
