import React from "react";
import "../styles/FloatButton.css";

export default function FloatButton({ onClick, icon = "+", size = 60 }) {
  return (
    <button
      className="fab-button"
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.5}px`,
      }}
    >
      {icon}
    </button>
  );
}