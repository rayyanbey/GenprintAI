import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { getModels } from "@/lib/db-dynamic";
import { randomUUID } from "crypto";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const models = await getModels();
    const { Design, CommunityPost } = models;
    const { id } = await params;

    const sourceDesign = await Design.findByPk(id);
    if (!sourceDesign) {
      return NextResponse.json({ success: false, error: "Design not found" }, { status: 404 });
    }

    const isOwner = sourceDesign.user_id === session.user.id;
    const isCommunity = Boolean(sourceDesign.is_community);
    const sharedPost = await CommunityPost.findOne({ where: { design_id: id } });

    if (!isOwner && !isCommunity && !sharedPost) {
      return NextResponse.json({ success: false, error: "This design is not available to remix" }, { status: 403 });
    }

    const remixedDesign = await Design.create({
      id: randomUUID(),
      user_id: session.user.id,
      title: `Remix of ${sourceDesign.title || "Community Design"}`,
      description: sourceDesign.description || "",
      template_id: sourceDesign.template_id || null,
      canvas_data: sourceDesign.canvas_data
        ? JSON.parse(JSON.stringify(sourceDesign.canvas_data))
        : null,
      artwork_file_url: sourceDesign.artwork_file_url || null,
      export_format: sourceDesign.export_format || "png",
      version_number: 1,
      parent_design_id: sourceDesign.id,
      tags: sourceDesign.tags || [],
      metadata: {
        ...(sourceDesign.metadata || {}),
        remixed_from_design_id: sourceDesign.id,
        remixed_from_user_id: sourceDesign.user_id,
      },
      approval_status: "approved",
      is_community: false,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true, design: remixedDesign }, { status: 201 });
  } catch (error: any) {
    console.error("Remix design error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
