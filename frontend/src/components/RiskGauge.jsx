import React from 'react';
import { motion } from "framer-motion";

export default function RiskGauge({ score }) {
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#10b981";
  const label = score >= 70 ? "CRITICAL" : score >= 40 ? "ELEVATED" : "SECURE";
  const r = 70;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 py-4">
      <div className="relative">
        <svg viewBox="0 0 200 120" className="w-56 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <path 
            d="M20 105 A80 80 0 0 1 180 105" 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="16" 
            strokeLinecap="round"
          />
          <motion.path 
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            d="M20 105 A80 80 0 0 1 180 105" 
            fill="none" 
            stroke={color} 
            strokeWidth="16" 
            strokeLinecap="round"
            strokeDasharray={circ}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
          <text 
            x="100" 
            y="95" 
            textAnchor="middle" 
            fill="white" 
            fontSize="38" 
            fontWeight="900" 
            fontFamily="'Outfit', sans-serif"
            className="tracking-tighter"
          >
            {score}
          </text>
          <text 
            x="100" 
            y="115" 
            textAnchor="middle" 
            fill={color} 
            fontSize="10" 
            fontWeight="900" 
            fontFamily="'Outfit', sans-serif"
            letterSpacing="4"
          >
            {label}
          </text>
        </svg>
      </div>
      <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mt-2">Composite Risk Vector</p>
    </div>
  );
}
