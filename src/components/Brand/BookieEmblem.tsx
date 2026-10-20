import React from "react";

interface BookieEmblemProps {
  className?: string;
  size?: number;
}

export function BookieEmblem({ className = "", size = 32 }: BookieEmblemProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      {/* Archival Crimson Squircle Background */}
      <rect width="48" height="48" rx="12" fill="#904A43" />
      {/* Open Codex Book Foil Lines */}
      <path
        d="M12 34C15.5 32 20 32.5 24 35C28 32.5 32.5 32 36 34V15C32.5 13 28 13.5 24 16C20 13.5 15.5 13 12 15V34Z"
        stroke="#FFF7ED"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 16V35" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" />
      {/* AI Spark / Academic Starburst in Archival Gold */}
      <path
        d="M24 7L25.5 10.5L29 12L25.5 13.5L24 17L22.5 13.5L19 12L22.5 10.5L24 7Z"
        fill="#FBBF24"
      />
      <circle cx="34" cy="11" r="1.5" fill="#FDE68A" />
    </svg>
  );
}
