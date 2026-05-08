import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { getModels } from "@/lib/db-dynamic";

function parsePostId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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
    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const models = await getModels();
    const post = await models.CommunityPost.findByPk(postId);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const existing = await models.CommunityRating.findOne({
      where: { post_id: postId, user_id: session.user.id },
    });

    const savedRating = existing
      ? await existing.update({ rating })
      : await models.CommunityRating.create({
          post_id: postId,
          user_id: session.user.id,
          rating,
          created_at: new Date(),
        });

    const allRatings = await models.CommunityRating.findAll({
      where: { post_id: postId },
      attributes: ["rating"],
    });
    const values = allRatings.map((item: any) => Number(item.rating || 0));
    const averageRating = values.length
      ? values.reduce((sum: number, value: number) => sum + value, 0) / values.length
      : 0;

    return NextResponse.json({
      success: true,
      rating: savedRating,
      averageRating,
      ratingsCount: values.length,
    });
  } catch (error: any) {
    console.error("Save community rating error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
