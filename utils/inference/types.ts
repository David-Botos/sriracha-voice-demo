export interface PromptParams {
    prompt: string;
    schema: ToolInputSchema;
  }
  
  export interface Tool {
    name: string;
    description: string;
    input_schema: ToolInputSchema;
  }
  
  export interface ToolInputSchema {
    type: string;
    properties: Record<string, Property>;
    required: string[];
    description?: string;
  }
  
  export interface Property {
    type: string;
    description?: string;
    items?: Record<string, any>;
  }
  
  export interface Message {
    role: string;
    content: string;
  }
  
  export interface TriagePromptRequest {
    model: string;
    max_tokens: number;
    tools: Tool[];
    messages: Message[];
  }
  
  export interface InferenceResponse {
    content: MessageContent[];
    role: string;
    model: string;
    id: string;
    type: string;
    usage: Usage;
    stop_reason: string;
    stop_sequence: any;
  }
  
  export interface MessageContent {
    type: string;
    text?: string;
    id?: string;
    name?: string;
    input?: any;
  }
  
  export interface ToolUseData {
    id: string;
    name: string;
    input: any;
  }
  
  export interface Usage {
    input_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    output_tokens: number;
  }