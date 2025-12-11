import { NextResponse } from "next/server";
import { models } from "@/src/db/db";

export async function POST(req: Request) {
  const { post_id, user_id } = await req.json();

  try {
    // Check if already liked
    const existing = await models.PostLike.findOne({
      where: { post_id, user_id },
    });

    if (existing) {
      // Unlike (remove like)
      await existing.destroy();
      return NextResponse.json({ ok: true, liked: false });
    } else {
      // Like
      await models.PostLike.create({ post_id, user_id });
      return NextResponse.json({ ok: true, liked: true });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
