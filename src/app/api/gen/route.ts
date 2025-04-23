import { NextRequest, NextResponse } from "next/server";
import { generateCodePuzzle } from "@/lib/openai";
import { stubbedResponse } from "@/lib/stub";

export async function POST(request: NextRequest) {
  try {
    //const { prompt, apiKey } = await request.json();
    //
    //if (!prompt || !apiKey) {
    //  return NextResponse.json(
    //    { error: "BAD REQUEST: Prompt and API key are required" },
    //    { status: 400 },
    //  );
    //}
    //
    //const puzzle = await generateCodePuzzle(prompt, apiKey);

    const puzzle = stubbedResponse;

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error("Error generating puzzle:", error);
    return NextResponse.json(
      { error: "ISE: Failed to generate puzzle" },
      { status: 500 },
    );
  }
}
