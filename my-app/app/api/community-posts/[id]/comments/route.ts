import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { getModels } from "@/lib/db-dynamic";

function parsePostId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parsePostId(id);
    if (!postId) {
      return NextResponse.json({ success: false, error: "Valid post id is required" }, { status: 400 });
    }

    const models = await getModels();
    const { CommunityComment, User } = models;
    const comments = await CommunityComment.findAll({
      where: { post_id: postId },
      include: [{ model: User, attributes: ["id", "username", "full_name", "avatar_url"], required: false }],
      order: [["created_at", "ASC"]],
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      comments: comments.map((comment: any) => {
        const plain = comment.get({ plain: true });
        return {
          id: plain.id,
          post_id: plain.post_id,
          content: plain.content,
          created_at: plain.created_at,
          user: plain.User
            ? {
                id: plain.User.id,
                username: plain.User.username,
                full_name: plain.User.full_name,
                avatar_url: plain.User.avatar_url,
              }
            : null,
        };
      }),
    });
  } catch (error: any) {
    console.error("Fetch community comments error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parsePostId(id);
    if (!postId) {
      return NextResponse.json({ success: false, error: "Valid post id is required" }, { status: 400 });
    }

    const body = await request.json();
    const content = String(body?.content || "").trim();
    if (!content) {
      return NextResponse.json({ success: false, error: "Comment content is required" }, { status: 400 });
    }

    const models = await getModels();
    const post = await models.CommunityPost.findByPk(postId);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const comment = await models.CommunityComment.create({
      post_id: postId,
      user_id: session.user.id,
      content,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error: any) {
    console.error("Create community comment error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
