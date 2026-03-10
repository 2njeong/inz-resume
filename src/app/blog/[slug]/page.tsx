import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { RoomLayout } from "@/components/layout/RoomLayout";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

const ACCENT = "#ffa060";

export const generateStaticParams = () => {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

type Props = {
  params: Promise<{ slug: string }>;
};

const BlogPostPage = async ({ params }: Props) => {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <RoomLayout title={post.title} accentColor={ACCENT}>
      <div className="mb-8">
        <p className="text-gray-500 mb-4">{post.date}</p>
        <div className="flex gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: `${ACCENT}10`,
                color: ACCENT,
                border: `1px solid ${ACCENT}25`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <article
        className="prose prose-invert max-w-none
          prose-headings:text-white
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-[#ffa060] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-code:text-[#ffa060] prose-code:bg-[#1a1030] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-[#0d0820] prose-pre:border prose-pre:border-[#ffa06020] prose-pre:rounded-xl
          prose-blockquote:border-l-[#ffa060] prose-blockquote:text-gray-400
          prose-hr:border-[#ffffff10]"
      >
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </RoomLayout>
  );
};

export default BlogPostPage;
