import { NextResponse } from "next/server";
import { models } from "@/src/db/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") || undefined;
  const limit = Number(searchParams.get("limit") || 10);

  const trends = await models.Trend.findAll({
    where: category ? { category } : undefined,
    order: [["score", "DESC"]],
    limit,
  });

  return NextResponse.json(trends);
}
