import { models, sequelize } from "@/src/db/db";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const [results] = await sequelize.query(`
        SELECT id, user_id, design_id, title, content, created_at
        FROM community_posts
        ORDER BY created_at DESC
        `);

        
        return NextResponse.json({ok:true, data:results})
    }
    catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : String(err);

    console.error('Fetch community posts failed:', err);

    return new NextResponse(
      JSON.stringify({
        ok: false,
        message: 'Failed to fetch posts',
        error: message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
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
