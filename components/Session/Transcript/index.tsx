import React, { useEffect, useRef } from "react";
import { TranscriptEntry } from "@/app/page";

interface TranscriptProps {
  entries: TranscriptEntry[];
}

const Transcript: React.FC<TranscriptProps> = ({ entries }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div>
      <p className="text-gray-600">
        Note: Spellings, emails, and phone numbers may be strange. This is a
        pre-alpha demo. Version 2 will include functions that help perfect the
        transcription of these elements, for now, small imperfections can
        usually be handled by the structured output inference displayed below
        after the conversation is over.
      </p>
      <div
        className="w-full max-h-96 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 mt-4 p-2"
        ref={containerRef}
      >
        <div className="flex flex-col gap-3">
          {entries.length === 0 ? (
            <div className="flex justify-center items-center h-24 text-gray-500 italic">
              <p>Your conversation will appear here...</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex w-full ${
                  entry.source === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 px-4 rounded-2xl relative ${
                    entry.source === "user"
                      ? "bg-blue-50 rounded-br-sm"
                      : "bg-white border border-gray-200 rounded-bl-sm"
                  } ${!entry.final ? "opacity-70 border-dashed" : ""}`}
                >
                  <div className="leading-normal whitespace-pre-wrap">
                    {entry.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcript;
