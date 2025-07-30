"use client";

import React, { useEffect } from "react";
import JsonView from "@microlink/react-json-view";

interface JsonViewerProps {
  data: any;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [mounted, SetMounted] = React.useState(false);
  useEffect(() => {
    SetMounted(true);
  }, []);
  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 text-black dark:text-white">
      {mounted && (
        <JsonView
          src={data}
          // theme="atom"
          iconStyle="square"
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "transparent",
            color: "inherit",
          }}
        />
      )}
    </div>
  );
};

export default JsonViewer;
