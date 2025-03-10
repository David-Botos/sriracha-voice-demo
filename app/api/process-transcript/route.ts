// app/api/process-transcript/route.ts
import { NextRequest, NextResponse } from "next/server";
import { b } from "../../../baml_client";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { transcript } = body;
    
    // Process with your BAML client
    const response = await b.ExtractContactInformation(transcript);

    // Return the response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error processing transcript:", error);
    return NextResponse.json(
      { error: "Failed to process transcript" },
      { status: 500 }
    );
  }
}