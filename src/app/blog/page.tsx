import Link from "next/link";
import { RoomLayout } from "@/components/layout/RoomLayout";
import { getAllPosts } from "@/lib/blog";

const ACCENT = "#ffa060";

const BlogPage = () => {
  const posts = getAllPosts();

  return (
    <RoomLayout title="Blog" accentColor={ACCENT}>
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✏️</div>
          <p className="text-gray-400 text-lg">No posts yet.</p>
          <p className="text-gray-600 text-sm mt-2">Coming soon...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-xl border transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: "rgba(20, 15, 40, 0.8)",
                borderColor: `${ACCENT}20`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3
                    className="text-lg font-bold text-white mb-1.5 group-hover:underline"
                    style={{ textDecorationColor: ACCENT }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{post.date}</p>
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
                <span
                  className="text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: ACCENT }}
                >
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </RoomLayout>
  );
};

export default BlogPage;
