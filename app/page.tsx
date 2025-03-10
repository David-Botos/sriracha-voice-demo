"use client";

import { DailyTransport } from "@daily-co/realtime-ai-daily";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useEffect, useRef, useState } from "react";
import { LLMHelper, RTVIClient } from "realtime-ai";
import { RTVIClientAudio, RTVIClientProvider } from "realtime-ai-react";

import App from "@/components/App";
import { AppProvider } from "@/components/context";
import Header from "@/components/Header";
import Splash from "@/components/Splash";
import Transcript from "@/components/Session/Transcript";
import StructuredOutputViewer from "@/components/Session/StructOutput";
import {
  BOT_READY_TIMEOUT,
  defaultConfig,
  defaultServices,
} from "@/rtvi.config";

// Define types for transcript entries
export type TranscriptEntry = {
  id: string;
  text: string;
  source: "user" | "bot";
  timestamp: string;
  final: boolean;
};

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const voiceClientRef = useRef<RTVIClient | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | undefined>(
    undefined
  );

  // Generate a unique ID for transcript entries
  const generateEntryId = () =>
    `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Helper function to update a non-final transcript entry
  const updatePartialTranscript = (
    newText: string,
    source: "user" | "bot",
    timestamp: string
  ) => {
    setTranscript((prevTranscript) => {
      // Find the last non-final entry from this source
      const lastIndex = [...prevTranscript]
        .reverse()
        .findIndex((entry) => entry.source === source && !entry.final);

      if (lastIndex === -1) {
        // If no non-final entry exists, create a new one
        return [
          ...prevTranscript,
          {
            id: generateEntryId(),
            text: newText,
            source,
            timestamp,
            final: false,
          },
        ];
      } else {
        // Update the existing non-final entry
        const actualIndex = prevTranscript.length - 1 - lastIndex;
        const updated = [...prevTranscript];
        updated[actualIndex] = {
          ...updated[actualIndex],
          text: newText,
          timestamp,
        };
        return updated;
      }
    });
  };

  // Helper function to add a final transcript entry
  const addFinalTranscript = (
    text: string,
    source: "user" | "bot",
    timestamp: string
  ) => {
    setTranscript((prevTranscript) => {
      // Find any non-final entries from this source
      const lastIndex = [...prevTranscript]
        .reverse()
        .findIndex((entry) => entry.source === source && !entry.final);

      if (lastIndex === -1) {
        // If no non-final entry exists, just add a new final entry
        return [
          ...prevTranscript,
          {
            id: generateEntryId(),
            text,
            source,
            timestamp,
            final: true,
          },
        ];
      } else {
        // Replace the non-final entry with a final one
        const actualIndex = prevTranscript.length - 1 - lastIndex;
        const updated = [...prevTranscript];
        updated[actualIndex] = {
          id: updated[actualIndex].id,
          text,
          source,
          timestamp,
          final: true,
        };
        return updated;
      }
    });
  };

  useEffect(() => {
    if (!showSplash || voiceClientRef.current) {
      return;
    }

    const voiceClient = new RTVIClient({
      callbacks: {
        onUserTranscript(data) {
          // Handle user transcript updates
          if (data.final) {
            addFinalTranscript(data.text, "user", data.timestamp);
          } else {
            updatePartialTranscript(data.text, "user", data.timestamp);
          }
        },
        onBotTranscript(data) {
          // Handle bot transcript updates (these are always final according to docs)
          addFinalTranscript(data.text, "bot", data.timestamp);
        },
        // You could also use onBotTtsText for more granular updates if needed
      },
      transport: new DailyTransport(),
      params: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
        requestData: {
          services: defaultServices,
          config: defaultConfig,
        },
      },
      timeout: BOT_READY_TIMEOUT,
    });

    const llmHelper = new LLMHelper({});
    voiceClient.registerHelper("llm", llmHelper);

    voiceClientRef.current = voiceClient;
  }, [showSplash]);

  if (showSplash) {
    return <Splash handleReady={() => setShowSplash(false)} />;
  }

  const processTranscript = async () => {
    console.log("processTranscript() was triggered");
    // Only process if we have transcript entries
    if (transcript.length === 0) return;

    setIsProcessing(true);
    setProcessingError(undefined);

    try {
      // Format transcript entries as a single string with newlines
      const transcriptString = transcript
        .map((entry) => {
          // Format: [SOURCE] Text
          return `[${entry.source.toUpperCase()}] ${entry.text}`;
        })
        .join("\n");

      // Call your API endpoint with the formatted string
      const response = await fetch("/api/process-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: transcriptString }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setStructuredData(data);
    } catch (error) {
      console.error("Error processing transcript:", error);
      setProcessingError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <RTVIClientProvider client={voiceClientRef.current!}>
      <AppProvider>
        <TooltipProvider>
          <main>
            <Header />
            <div id="app" className="flex !flex-row">
              <div className="w-1/2 flex items-center">
                <App />
              </div>
              <div className="w-1/2">
                <Transcript entries={transcript} />
                <div className="flex justify-center my-4">
                  <button
                    onClick={processTranscript}
                    disabled={isProcessing || transcript.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 21h4m-2-3v-8m0 0L9 7m3 3l3-3M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5z"
                          />
                        </svg>
                        <span>Extract Contacts</span>
                      </>
                    )}
                  </button>
                </div>
                <StructuredOutputViewer
                  data={structuredData}
                  isLoading={isProcessing}
                  error={processingError}
                  title="Conversation Analysis"
                />
              </div>
            </div>
          </main>
          <aside id="tray" />
        </TooltipProvider>
      </AppProvider>
      <RTVIClientAudio />
    </RTVIClientProvider>
  );
}
