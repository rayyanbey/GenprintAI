import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { getModels } from "@/lib/db-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { post_id } = await req.json();
    const postId = Number(post_id);
    if (!Number.isInteger(postId)) {
      return NextResponse.json({ ok: false, error: "Valid post_id is required" }, { status: 400 });
    }

    const models = await getModels();
    const post = await models.CommunityPost.findByPk(postId);
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    const existing = await models.PostLike.findOne({
      where: { post_id: postId, user_id: session.user.id },
    });

    if (existing) {
      await existing.destroy();
      return NextResponse.json({ ok: true, liked: false });
    }

    await models.PostLike.create({ post_id: postId, user_id: session.user.id });
    return NextResponse.json({ ok: true, liked: true });
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
