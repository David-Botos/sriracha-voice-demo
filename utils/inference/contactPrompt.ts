import { ToolInputSchema } from "./types";

/**
 * Generate a prompt for extracting contact information from a transcript
 */
export function generateContactCategoryPrompt(transcript: string): {
  prompt: string;
  schema: ToolInputSchema;
  error: Error | null;
} {
  console.debug("Generating contact category prompt");

  const prompt = `Extract contact information for community organization staff/representatives (not call center agents) from the following transcript. Follow these rules:

Contact Information Rules:
1. Data Requirements:
   - Include a contact entry if ANY of these are mentioned: name, email, or phone number
   - Phone numbers must be formatted with country code (default to +1 for US)
   - Extensions must be in integer format
   - Capture contextual information about phone numbers in the phoneDescription field, such as:
      * Whether it's a front desk, direct line, or general contact
      * Any specific guidance about when to use the number
      * Whether it's a personal or shared line

2. Scope:
   - Only extract contact information for staff/representatives of the community organizations
   - Do NOT create entries for call center agents or other 211 staff

Conversation Transcript:
${transcript}

IMPORTANT: Respond ONLY with the structured data output. Do not include any additional text, explanations, or notes.`;

  return { prompt, schema: contactInformationSchema, error: null };
}

/**
 * Schema for contact information extraction
 */
export const contactInformationSchema: ToolInputSchema = {
  type: "object",
  properties: {
    contacts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "The contact's name, which may include first name only or both first and last names",
          },
          title: {
            type: "string",
            description: "The contact's job title",
          },
          department: {
            type: "string",
            description: "The contact's department",
          },
          email: {
            type: "string",
            description: "The contact's email address",
          },
          phone: {
            type: "string",
            description:
              "The contact's phone number in international format (e.g., '+12344567890'). Assume +1 for US when no country code is specified",
          },
          phoneDescription: {
            type: "string",
            description:
              "A description of what to expect when calling this number (e.g., 'front desk', 'direct line', 'after-hours emergency line')",
          },
          phoneExtension: {
            type: "integer",
            description: "The contact's phone extension in integer format",
          },
        },
        anyOf: [
          {
            required: ["name"],
          },
          {
            required: ["email"],
          },
          {
            required: ["phone"],
          },
        ],
      },
    },
  },
  required: ["contacts"],
};

/**
 * Type for contact inference output
 */
export interface ContactInference {
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  phoneDescription?: string;
  phoneExtension?: number;
}

/**
 * Type for the overall contact inference output
 */
export interface ContactInfOutput {
  contacts: ContactInference[];
}
