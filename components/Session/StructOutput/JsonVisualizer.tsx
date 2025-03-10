import React, { useState } from "react";

// Types for the JSON visualizer
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonVisualizerProps {
  data: JsonValue;
  title?: string;
}

const JsonVisualizer: React.FC<JsonVisualizerProps> = ({ data, title }) => {
  // Component for rendering a JSON node (key-value pair or array item)
  const JsonNode = ({
    data,
    path = [],
    level = 0,
  }: {
    data: JsonValue;
    path?: (string | number)[];
    level?: number;
  }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2);

    const getNodeId = () => path.join("-");

    // Get the type of value for appropriate rendering
    const getValueType = (val: JsonValue): string => {
      if (val === null) return "null";
      if (Array.isArray(val)) return "array";
      return typeof val;
    };

    const valueType = getValueType(data);
    const isComplex = valueType === "object" || valueType === "array";
    const isEmpty =
      isComplex &&
      ((valueType === "object" &&
        Object.keys(data as JsonObject).length === 0) ||
        (valueType === "array" && (data as JsonArray).length === 0));

    // Toggle expanded state for objects and arrays
    const toggleExpand = () => {
      if (isComplex && !isEmpty) {
        setIsExpanded(!isExpanded);
      }
    };

    // Render different types of values
    const renderValue = () => {
      if (valueType === "string") {
        return <span className="text-green-600">{data as string}</span>;
      } else if (valueType === "number") {
        return <span className="text-purple-600">{data as number}</span>;
      } else if (valueType === "boolean") {
        return <span className="text-orange-600">{String(data)}</span>;
      } else if (valueType === "null") {
        return <span className="text-gray-500">null</span>;
      } else if (isEmpty) {
        return (
          <span className="text-gray-500">
            {valueType === "array" ? "[]" : "{}"}
          </span>
        );
      } else if (isComplex) {
        return (
          <span className="text-gray-500">
            {valueType === "array" ? "[" : "{"}
            {!isExpanded && "..."}
            {!isExpanded && (valueType === "array" ? "]" : "}")}
          </span>
        );
      }
      return null;
    };

    // Render the children of objects and arrays
    const renderChildren = () => {
      if (!isComplex || isEmpty || !isExpanded) return null;

      if (valueType === "object") {
        const obj = data as JsonObject;
        return (
          <>
            {Object.entries(obj).map(([key, value], index) => (
              <div
                key={`${getNodeId()}-${key}`}
                style={{ paddingLeft: `${level * 16 + 16}px` }}
              >
                <JsonNode
                  data={value}
                  path={[...path, key]}
                  level={level + 1}
                />
              </div>
            ))}
            <div
              style={{ paddingLeft: `${level * 16}px` }}
              className="text-gray-500"
            >
              {"}"}
            </div>
          </>
        );
      } else if (valueType === "array") {
        const arr = data as JsonArray;
        return (
          <>
            {arr.map((value, index) => (
              <div
                key={`${getNodeId()}-${index}`}
                style={{ paddingLeft: `${level * 16 + 16}px` }}
              >
                <JsonNode
                  data={value}
                  path={[...path, index]}
                  level={level + 1}
                />
              </div>
            ))}
            <div
              style={{ paddingLeft: `${level * 16}px` }}
              className="text-gray-500"
            >
              {"]"}
            </div>
          </>
        );
      }
      return null;
    };

    // Main render
    return (
      <div className="font-mono text-sm">
        <div
          className="flex items-start py-1 hover:bg-gray-50 rounded"
          onClick={toggleExpand}
          style={{ cursor: isComplex && !isEmpty ? "pointer" : "default" }}
        >
          {isComplex && !isEmpty && (
            <span className="mr-1 text-gray-500 w-4">
              {isExpanded ? "▼" : "►"}
            </span>
          )}

          {!isComplex && <span className="mr-1 w-4"></span>}

          {/* For root level, don't show key */}
          {path.length > 0 && (
            <>
              <span className="text-blue-600 mr-1">
                {typeof path[path.length - 1] === "number"
                  ? `[${path[path.length - 1]}]`
                  : `"${path[path.length - 1]}"`}
                :
              </span>
            </>
          )}

          {renderValue()}
        </div>

        {renderChildren()}
      </div>
    );
  };

  // Check if data is available
  if (!data) {
    return <div className="text-gray-500 italic">No data available</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium">
          {title}
        </div>
      )}
      <div className="p-4 overflow-auto max-h-[600px]">
        <JsonNode data={data} />
      </div>
    </div>
  );
};

export default JsonVisualizer;
