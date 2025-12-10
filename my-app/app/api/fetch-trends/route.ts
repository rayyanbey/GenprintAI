import { NextResponse } from "next/server";
import { fetchRedditTrends } from "@/src/services/fetchRedditTrends";


export async function GET() {
  await fetchRedditTrends();
  return NextResponse.json({ message: "Trends fetched" });
}
