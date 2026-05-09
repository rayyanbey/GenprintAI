import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { getModels } from "@/lib/db-dynamic";

function parsePostId(value: string | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const models = await getModels();
    const {
      CommunityPost,
      PostLike,
      CommunityComment,
      CommunityRating,
      Design,
      User,
    } = models;

    const { count, rows: posts } = await CommunityPost.findAndCountAll({
      include: [
        {
          model: Design,
          attributes: [
            "id",
            "title",
            "description",
            "artwork_file_url",
            "template_id",
            "created_at",
          ],
          required: true,
        },
        {
          model: User,
          attributes: ["id", "username", "full_name", "avatar_url"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const data = await Promise.all(
      posts.map(async (post: any) => {
        const plain = post.get({ plain: true });
        const [likes, comments, ratings, likedByMe, myRating] = await Promise.all([
          PostLike.count({ where: { post_id: plain.id } }),
          CommunityComment.count({ where: { post_id: plain.id } }),
          CommunityRating.findAll({ where: { post_id: plain.id }, attributes: ["rating"] }),
          userId
            ? PostLike.findOne({ where: { post_id: plain.id, user_id: userId } })
            : Promise.resolve(null),
          userId
            ? CommunityRating.findOne({ where: { post_id: plain.id, user_id: userId } })
            : Promise.resolve(null),
        ]);

        const ratingValues = ratings.map((rating: any) => Number(rating.rating || 0));
        const averageRating =
          ratingValues.length > 0
            ? ratingValues.reduce((sum: number, rating: number) => sum + rating, 0) / ratingValues.length
            : 0;

        return {
          id: plain.id,
          user_id: plain.user_id,
          design_id: plain.design_id,
          title: plain.title,
          content: plain.content,
          created_at: plain.created_at,
          likes,
          likedByMe: Boolean(likedByMe),
          comments,
          averageRating,
          ratingsCount: ratingValues.length,
          myRating: myRating ? Number((myRating as any).rating || 0) : 0,
          design: plain.Design
            ? {
                id: plain.Design.id,
                title: plain.Design.title,
                description: plain.Design.description,
                artwork_file_url: plain.Design.artwork_file_url,
                template_id: plain.Design.template_id,
                created_at: plain.Design.created_at,
              }
            : null,
          user: plain.User
            ? {
                id: plain.User.id,
                username: plain.User.username,
                full_name: plain.User.full_name,
                avatar_url: plain.User.avatar_url,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      success: true,
      data,
      posts: data,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { ok: false, success: false, error: "Failed to fetch community posts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { design_id, title, content } = body;

    if (!design_id || !title?.trim()) {
      return NextResponse.json(
        { success: false, error: "design_id and title are required" },
        { status: 400 }
      );
    }

    const models = await getModels();
    const { CommunityPost, Design, Template } = models;
    const design = await Design.findOne({
      where: { id: design_id, user_id: session.user.id },
    });

    if (!design) {
      return NextResponse.json(
        { success: false, error: "Design not found or not owned by current user" },
        { status: 404 }
      );
    }

    const existingPost = await CommunityPost.findOne({
      where: { design_id, user_id: session.user.id },
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: "This design is already shared" },
        { status: 409 }
      );
    }

    const newPost = await CommunityPost.create({
      user_id: session.user.id,
      design_id,
      title: title.trim(),
      content: content?.trim() || "",
      created_at: new Date(),
    });

    await design.update({ is_community: true });

    // AUTO-CREATE TEMPLATE from shared design
    let category = 'apparel';
    if (design.metadata?.category) {
      category = design.metadata.category;
    } else if (design.tags && Array.isArray(design.tags)) {
      const tagCategory = design.tags.find((tag: string) =>
        ['apparel', 'accessories', 'home_living', 'tech', 'gifts'].includes(tag.toLowerCase())
      );
      if (tagCategory) category = tagCategory.toLowerCase();
    }

    try {
      const { v4: uuidv4 } = require('uuid');
      await Template.create({
        id: uuidv4(),
        name: title.trim(),
        description: design.description || '',
        category,
        usage_count: 0,
        is_community: true,
        created_by_user_id: session.user.id,
        approval_status: 'pending',
        metadata: {
          design_id: design.id,
          image_url: design.artwork_file_url,
          canvas_data: design.canvas_data,
          export_format: design.export_format || 'png',
          shared_content: content?.trim() || '',
        },
      });
    } catch (templateError: any) {
      console.warn(`Warning: Could not create template: ${templateError.message}`);
    }

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error: any) {
    console.error("Create community post error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, content } = body;
    const postId = Number(id);

    if (!Number.isInteger(postId)) {
      return NextResponse.json({ success: false, message: "Valid post ID required" }, { status: 400 });
    }

    const models = await getModels();
    const post = await models.CommunityPost.findByPk(postId);
    if (!post || post.user_id !== session.user.id) {
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = parsePostId(searchParams.get("id"));

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "Post ID required" },
        { status: 400 }
      );
    }

    const models = await getModels();
    const post = await models.CommunityPost.findByPk(postId);
    if (!post || post.user_id !== session.user.id) {
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
