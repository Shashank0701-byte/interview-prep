import React from "react";

const ChartNoDataIllustration = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <svg
        width="150"
        height="150"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <line x1="9" y1="9" x2="9" y2="9" />
        <line x1="15" y1="9" x2="15" y2="9" />
      </svg>
      <p>No data available</p>
    </div>
  );
};

export { ChartNoDataIllustration };
