import React from "react";

export default function Logo({ className = "", size = "100%" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="volleyreel-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="35%" stopColor="#fb923c" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <mask id="volleyreel-volleyball-mask">
          {/* Base circle background in mask: white means visible */}
          <rect width="100%" height="100%" fill="black" />
          <circle cx="50" cy="50" r="36" fill="white" />
          
          {/* Seams drawn in black to make them cut out/transparent */}
          {/* Main Dividers */}
          <path
            d="M 50 50 C 42 34, 46 22, 50 14"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 50 50 C 62 50, 74 58, 81.2 68"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 50 50 C 42 62, 30 66, 18.8 68"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Sector 1 (Top-Right) Panels */}
          <path
            d="M 50 26 C 60 30, 70 38, 76 48"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 50 38 C 56 42, 64 48, 68 59"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Sector 2 (Bottom) Panels */}
          <path
            d="M 68 59 C 62 68, 52 76, 40 76"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 58 68 C 52 74, 42 78, 29 76"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Sector 3 (Top-Left) Panels */}
          <path
            d="M 40 76 C 34 66, 29 54, 28 40"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 29 60 C 26 50, 28 38, 36 27"
            stroke="black"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </mask>
      </defs>

      {/* Main Gradient Volleyball */}
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="url(#volleyreel-logo-grad)"
        mask="url(#volleyreel-volleyball-mask)"
      />

      {/* Thin Outer Dash Ring for a high-tech analytical feel */}
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="url(#volleyreel-logo-grad)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.7"
      />
    </svg>
  );
}
