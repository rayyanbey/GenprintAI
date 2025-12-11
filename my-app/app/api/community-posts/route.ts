import { models, sequelize } from "@/src/db/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = "test-user-1"; // later replace with real session user

    const [results] = await sequelize.query(`
    SELECT 
        p.*,
        COUNT(l.id)::int as likes,
        BOOL_OR(l.user_id = '${userId}') as "likedByMe"
    FROM community_posts p
    LEFT JOIN post_likes l ON p.id = l.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    `);


    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, designid, title, content } = body;

    const newPost = await models.CommunityPost.create({
      user_id,
      designid,
      title,
      content,
      postedat: new Date(),
    });

    return NextResponse.json({ success: true, data: newPost });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, content } = body;

    const post = await models.CommunityPost.findByPk(id);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    await post.update({ title, content });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID required" },
        { status: 400 }
      );
    }

    const post = await models.CommunityPost.findByPk(id);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    await post.destroy();

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
