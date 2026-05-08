import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { getModels } from "@/lib/db-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const models = await getModels();
    const { Design, DesignCollaborator, User } = models;
    const { id } = await params;
    const design = await Design.findByPk(id);
    if (!design || design.user_id !== session.user.id) {
      return NextResponse.json({ success: false, error: "Design not found" }, { status: 404 });
    }

    const collaborators = await DesignCollaborator.findAll({
      where: { design_id: id },
      include: [{ model: User, attributes: ["id", "username", "email", "full_name", "avatar_url"], required: false }],
      order: [["created_at", "DESC"]],
    });

    return NextResponse.json({ success: true, collaborators });
  } catch (error: any) {
    console.error("Fetch collaborators error:", error);
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

    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const role = body?.role === "editor" ? "editor" : "viewer";
    if (!email) {
      return NextResponse.json({ success: false, error: "Collaborator email is required" }, { status: 400 });
    }

    const models = await getModels();
    const { Design, User, DesignCollaborator } = models;
    const { id } = await params;
    const design = await Design.findByPk(id);
    if (!design || design.user_id !== session.user.id) {
      return NextResponse.json({ success: false, error: "Design not found" }, { status: 404 });
    }

    const collaboratorUser = await User.findOne({ where: { email } });
    if (!collaboratorUser) {
      return NextResponse.json({ success: false, error: "No user found with that email" }, { status: 404 });
    }

    if (collaboratorUser.id === session.user.id) {
      return NextResponse.json({ success: false, error: "You already own this design" }, { status: 400 });
    }

    const existing = await DesignCollaborator.findOne({
      where: { design_id: id, user_id: collaboratorUser.id },
    });

    const collaborator = existing
      ? await existing.update({ role })
      : await DesignCollaborator.create({
          design_id: id,
          user_id: collaboratorUser.id,
          invited_by: session.user.id,
          role,
          created_at: new Date(),
        });

    return NextResponse.json({ success: true, collaborator }, { status: existing ? 200 : 201 });
  } catch (error: any) {
    console.error("Save collaborator error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
