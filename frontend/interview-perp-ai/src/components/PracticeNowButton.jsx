
import React from "react";

const PracticeNowButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
    >
      Practice Now
    </button>
  );
};

export default PracticeNowButton;
