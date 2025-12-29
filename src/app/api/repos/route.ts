import { NextResponse } from "next/server";

import { fetchDistinctRepos } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json([]);
  }

  try {
    const repos = await fetchDistinctRepos();
    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json([]);
  }
}
