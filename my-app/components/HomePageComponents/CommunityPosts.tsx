"use client";

import { useEffect, useState } from "react";

interface CommunityPost {
  id: number;
  user_id: string;
  design_id: string;
  title: string;
  content: string;
  created_at:string;
  likes: number;
  likedByMe: Boolean;
}

export default function CommunityPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community-posts")
        .then((res) => res.json())
        .then((data) => {
        if (data.ok) {
            setPosts(data.data);
        }
        setLoading(false);
        })
        .catch((err) => {
        setLoading(false);
        });
    }, []);

    const userId = "test-user-1"; // TEMP - later replace with real auth user

    const handleLike = async (postId: number) => {
        // Instant UI toggle
        setPosts((prev) =>
            prev.map((post) =>
            post.id === postId
                ? {
                    ...post,
                    likes: post.likedByMe
                    ? Number(post.likes) - 1
                    : Number(post.likes) + 1,
                    likedByMe: !post.likedByMe,
                }
                : post
            )
        );

        // Background API call
        await fetch("/api/community-posts/like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            post_id: postId,
            user_id: userId,
            }),
        });
        };


  if (loading) {
    return <p className="text-gray-600 text-center">Loading designs...</p>;
  }

  if (!loading && posts.length === 0) {
    return <p className="text-gray-600 text-center">No community posts yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div
        key={post.id}
        className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition"
        >
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
            {post.title}
        </h3>

        <p className="text-gray-600 mb-4">
            {post.content}
        </p>

        <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleString()}
            </p>

            <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-2 px-3 py-1 text-sm border rounded-full transition 
                ${post.likedByMe ? "bg-pink-100 border-pink-300 text-pink-600" 
                                : "border-gray-300 hover:bg-gray-100"}`}
            >
            {post.likedByMe ? "Liked" : "Like"} ({post.likes})
            </button>

        </div>
        </div>

        ))}

    </div>
  );
}
