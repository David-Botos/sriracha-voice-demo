import { NextRequest, NextResponse } from "next/server";
import { ClaudeClient } from "@/utils/inference/inference";
import {
  generateContactCategoryPrompt,
  ContactInfOutput,
} from "@/utils/inference/contactPrompt";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    console.log("Transcript received in /process-transcript");

    // Generate the prompt and schema
    const { prompt, schema, error } = generateContactCategoryPrompt(transcript);

    if (error) {
      console.error("Error generating prompt:", error);
      return NextResponse.json(
        { error: "Failed to generate prompt" },
        { status: 500 }
      );
    }

    // Initialize the Claude client
    const client = ClaudeClient.initInferenceClient();

    // Process with inference
    const response = await client.runClaudeInference({ prompt, schema });

    // Cast to expected output type
    const contactOutput = response as ContactInfOutput;

    console.log(
      `Extracted ${contactOutput.contacts.length} contacts from transcript`
    );

    // Return the response
    return NextResponse.json(contactOutput, { status: 200 });
  } catch (error) {
    console.error("Error processing transcript:", error);
    return NextResponse.json(
      { error: "Failed to process transcript" },
      { status: 500 }
    );
  }
}
