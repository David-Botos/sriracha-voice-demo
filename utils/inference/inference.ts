import {
  PromptParams,
  TriagePromptRequest,
  InferenceResponse,
  ToolInputSchema,
} from "./types";

export class ClaudeClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Initialize a new Claude inference client
   */
  static initInferenceClient(): ClaudeClient {
    console.debug("Initializing Claude inference client");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in environment");
      throw new Error("ANTHROPIC_API_KEY not found in environment");
    }
    return new ClaudeClient(apiKey);
  }

  /**
   * Performs inference with structured output validation
   */
  async runClaudeInference(params: PromptParams): Promise<Record<string, any>> {
    const maxRetries = 2;
    const retryDelay = 10000; // 10 seconds in milliseconds

    let lastErr: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        console.info(
          `Retrying Claude API request after delay (attempt ${attempt}, delay ${retryDelay}ms)`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      try {
        const response = await this.makeInferenceRequest(params);
        return response;
      } catch (err: any) {
        lastErr = err;
        if (this.isOverburdenedError(err) && attempt < maxRetries) {
          continue;
        }
        throw err;
      }
    }

    throw new Error(`Anthropic API is overburdened: ${lastErr?.message}`);
  }

  /**
   * Makes the actual request to the Claude API
   */
  private async makeInferenceRequest(
    params: PromptParams
  ): Promise<Record<string, any>> {
    console.debug("Starting Claude inference request", {
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1500,
    });

    const reqBody: TriagePromptRequest = {
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1500,
      tools: [
        {
          name: "structured_output",
          description: "Output should conform to the provided JSON schema",
          input_schema: params.schema,
        },
      ],
      messages: [
        {
          role: "user",
          content: params.prompt,
        },
      ],
    };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "token-efficient-tools-2025-02-19",
        },
        body: JSON.stringify(reqBody),
      });

      if (response.status === 529) {
        throw new Error("received status code 529");
      }

      if (!response.ok) {
        // Get more detailed error information
        const errorText = await response.text();
        console.error("API error details:", errorText);
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`
        );
      }

      console.debug(
        `Received response from Claude API with status ${response.status}`
      );

      const inferenceResp = (await response.json()) as InferenceResponse;

      console.debug("Successfully parsed inference response", {
        content_length: inferenceResp.content.length,
        model: inferenceResp.model,
        stop_reason: inferenceResp.stop_reason,
        usage: inferenceResp.usage,
      });

      let toolOutput: any = null;
      for (const content of inferenceResp.content) {
        if (content.type === "tool_use") {
          toolOutput = content.input;
          console.debug("Found tool output in response");
          break;
        }
      }

      if (toolOutput === null) {
        console.error("No structured output found in response");
        throw new Error("No structured output found in response");
      }

      if (!this.validateAgainstSchema(toolOutput, params.schema)) {
        console.error("Response validation failed");
        throw new Error("Response validation failed");
      }

      const contentMap = toolOutput as Record<string, any>;
      console.info(
        `Successfully processed Claude inference request with ${
          Object.keys(contentMap).length
        } fields`
      );

      return contentMap;
    } catch (err: any) {
      console.error("Failed during request execution", err);
      throw err;
    }
  }

  /**
   * Checks if the error is due to API overload
   */
  private isOverburdenedError(err: Error): boolean {
    return err.message.includes("529");
  }

  /**
   * Validates the response against the provided schema
   */
  private validateAgainstSchema(data: any, schema: ToolInputSchema): boolean {
    // Check if data is an object
    if (typeof data !== "object" || data === null) {
      return false;
    }

    // Validate required fields
    for (const required of schema.required) {
      if (!(required in data)) {
        return false;
      }
    }

    // Validate property types
    for (const [fieldName, property] of Object.entries(schema.properties)) {
      if (!(fieldName in data)) {
        continue; // Skip if field is not present and not required
      }

      const value = data[fieldName];

      // Check type
      switch (property.type) {
        case "string":
          if (typeof value !== "string") {
            return false;
          }
          break;
        case "number":
          if (typeof value !== "number") {
            return false;
          }
          break;
        case "boolean":
          if (typeof value !== "boolean") {
            return false;
          }
          break;
        case "array":
          if (!Array.isArray(value)) {
            return false;
          }
          break;
        case "object":
          if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
          ) {
            return false;
          }
          break;
      }
    }

    return true;
  }
}
