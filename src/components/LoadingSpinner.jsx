import React from "react";
import "../styles/LoadingSpinner.css";

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>답변을 기다리는 중...</p>
    </div>
  );
}