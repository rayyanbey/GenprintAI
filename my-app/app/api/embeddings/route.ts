import { NextResponse } from "next/server";
import { models } from "@/src/db/db";

const FASTAPI_URL=process.env.FASTAPI_URL

interface Body {
  design_id: string;
  prompt: string;
}

export async function GET() {
  try {
    const allEmbeddings = await models.DesignEmbedding.findAll({
      order: [["created_at", "DESC"]],
      limit: 100, // optional, you can paginate
    });

    return NextResponse.json({ ok: true, data: allEmbeddings });
  } catch (err) {
    console.error("Failed to fetch embeddings:", err);
    return NextResponse.json({ ok: false, message: "Failed to fetch embeddings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Body = await request.json();

    if (!body.design_id || !body.prompt) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Call the FastAPI embedding service
    const fastApiRes = await fetch(`${FASTAPI_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body.prompt }),
    });

    if (!fastApiRes.ok) {
      throw new Error("FastAPI embedding call failed");
    }

    const { embedding } = await fastApiRes.json();

    // 2️⃣ Store in Postgres
    const newEmbedding = await models.DesignEmbedding.create({
      design_id: body.design_id,
      prompt: body.prompt,
      embedding,
    });

    return NextResponse.json({ ok: true, data: newEmbedding });
  } catch (err) {
    console.error("Failed to generate/store embedding:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to generate/store embedding" },
      { status: 500 }
    );
  }
}


