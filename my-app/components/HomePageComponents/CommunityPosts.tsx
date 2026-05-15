"use client";

import { useEffect, useState } from "react";
import { Heart, MessageSquare, RefreshCw, Star } from "lucide-react";

interface CommunityPost {
  id: number;
  user_id: string;
  design_id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  likedByMe: boolean;
  comments: number;
  averageRating: number;
  ratingsCount: number;
  myRating: number;
  design?: {
    id: string;
    title: string;
    description?: string;
    artwork_file_url?: string;
  } | null;
  user?: {
    username?: string;
    full_name?: string;
  } | null;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user?: {
    username?: string;
    full_name?: string;
  } | null;
}

interface Trend {
  id: number;
  title: string;
}

export interface CommunityPostCardData extends CommunityPost {}

interface CommunityPostsProps {
  showAll?: boolean;
  onUseDesign?: (post: CommunityPostCardData) => void;
}

export default function CommunityPosts({ showAll = false, onUseDesign }: CommunityPostsProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<number | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [busyPostId, setBusyPostId] = useState<number | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const fetchPage = async (page: number) => {
        const response = await fetch(`/api/community-posts?page=${page}&limit=50`, { cache: "no-store" });
        const data = await response.json();
        return { response, data };
      };

      const firstPage = await fetchPage(1);
      if (firstPage.data.ok || firstPage.data.success) {
        const firstPagePosts = firstPage.data.data || firstPage.data.posts || [];
        const totalPages = Number(firstPage.data.pagination?.total_pages || 1);

        if (!showAll || totalPages <= 1) {
          setPosts(firstPagePosts);
          return;
        }

        const remainingPages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
        const otherPages = await Promise.all(
          remainingPages.map(async (page) => {
            const { data } = await fetchPage(page);
            return data.data || data.posts || [];
          })
        );

        setPosts([...firstPagePosts, ...otherPages.flat()]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    fetch("/api/trends")
      .then((res) => res.json())
      .then((data) => setTrends(Array.isArray(data) ? data : data?.trends || []))
      .catch(() => {});
  }, []);

  const handleLike = async (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likedByMe ? Math.max(0, Number(post.likes) - 1) : Number(post.likes) + 1,
              likedByMe: !post.likedByMe,
            }
          : post
      )
    );

    const response = await fetch("/api/community-posts/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });

    if (!response.ok) {
      loadPosts();
    }
  };

  const handleRating = async (postId: number, rating: number) => {
    const response = await fetch(`/api/community-posts/${postId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                myRating: rating,
                averageRating: data.averageRating,
                ratingsCount: data.ratingsCount,
              }
            : post
        )
      );
    }
  };

  const loadComments = async (postId: number) => {
    const response = await fetch(`/api/community-posts/${postId}/comments`, { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data.success) {
      setCommentsByPost((prev) => ({ ...prev, [postId]: data.comments || [] }));
    }
  };

  const toggleComments = async (postId: number) => {
    const nextPostId = activeCommentsPostId === postId ? null : postId;
    setActiveCommentsPostId(nextPostId);
    if (nextPostId && !commentsByPost[nextPostId]) {
      await loadComments(nextPostId);
    }
  };

  const submitComment = async (postId: number) => {
    const content = String(commentDrafts[postId] || "").trim();
    if (!content) return;

    setBusyPostId(postId);
    try {
      const response = await fetch(`/api/community-posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        await loadComments(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, comments: Number(post.comments || 0) + 1 } : post
          )
        );
      }
    } finally {
      setBusyPostId(null);
    }
  };

  // const handleRemix = async (designId?: string) => {
  //   if (!designId) return;
  //   setBusyPostId(-1);
  //   try {
  //     const response = await fetch(`/api/designs/${designId}/remix`, {
  //       method: "POST",
  //     });
  //     const data = await response.json();
  //     if (response.ok && data.success) {
  //       router.push(`/design-studio/${data.design.id}`);
  //     }
  //   } finally {
  //     setBusyPostId(null);
  //   }
  // };

  if (loading) {
    return <p className="text-gray-600 text-center">Loading designs...</p>;
  }

  if (!loading && posts.length === 0) {
    return <p className="text-gray-600 text-center">No community posts yet.</p>;
  }

  return (
    <div>
      {trends.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Trending Designs</h2>
          <div className="flex flex-wrap gap-3">
            {trends.slice(0, 6).map((trend) => (
              <div
                key={trend.id}
                className="px-4 py-2 rounded-full font-semibold cursor-pointer select-none"
                style={{
                  background: "linear-gradient(to right, #ef4444, #f3aeaeff)",
                  color: "#f8f1f1ff",
                }}
              >
                {trend.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={loadPosts}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition"
          >
            {post.design?.artwork_file_url && (
              <div className="mb-4 h-44 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={post.design.artwork_file_url}
                  alt={post.design.title || post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <h3 className="font-semibold text-lg text-gray-800 mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-3">{post.content}</p>

            <div className="mb-4 text-xs text-gray-400">
              Shared by {post.user?.full_name || post.user?.username || "Community member"} on{" "}
              {new Date(post.created_at).toLocaleDateString()}
            </div>

            <div className="mb-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(post.id, rating)}
                  className="p-1 text-amber-500 hover:scale-110 transition"
                  aria-label={`Rate ${rating} stars`}
                >
                  <Star
                    className="h-4 w-4"
                    fill={rating <= (post.myRating || Math.round(post.averageRating || 0)) ? "currentColor" : "none"}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-gray-500">
                {Number(post.averageRating || 0).toFixed(1)} ({post.ratingsCount || 0})
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 px-3 py-1 text-sm border rounded-full transition ${
                  post.likedByMe
                    ? "bg-pink-100 border-pink-300 text-pink-600"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Heart className="w-4 h-4" fill={post.likedByMe ? "currentColor" : "none"} />
                {post.likes}
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                <MessageSquare className="w-4 h-4" />
                {post.comments || 0}
              </button>

              {onUseDesign && post.design?.artwork_file_url && (
                <button
                  onClick={() => onUseDesign(post)}
                  className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-gradient-to-r from-[#f08080] to-[#f4978e] text-white hover:opacity-90 transition"
                >
                  Use in Mockups
                </button>
              )}

              {/* <button
                onClick={() => handleRemix(post.design?.id || post.design_id)}
                disabled={busyPostId !== null}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <GitFork className="w-4 h-4" />
                Remix
              </button> */}
            </div>

            {activeCommentsPostId === post.id && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  {(commentsByPost[post.id] || []).map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-700">
                        {comment.user?.full_name || comment.user?.username || "Community member"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={commentDrafts[post.id] || ""}
                    onChange={(event) =>
                      setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))
                    }
                    placeholder="Add feedback..."
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f08080]"
                  />
                  <button
                    onClick={() => submitComment(post.id)}
                    disabled={busyPostId === post.id}
                    className="px-4 py-2 text-sm rounded-lg bg-[#f4978e] text-white hover:bg-[#f08080] disabled:opacity-50 transition"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
