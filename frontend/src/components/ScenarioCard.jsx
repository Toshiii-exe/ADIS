import React from 'react';
import { motion } from "framer-motion";
import { ChevronRight, ShieldCheck, AlertCircle, Zap, Target, Eye } from "lucide-react";

export default function ScenarioCard({ s, i }) {
  const impactStyles = { 
    Critical: "text-red-400 border-red-500/20 bg-red-500/5", 
    High: "text-orange-400 border-orange-500/20 bg-orange-500/5", 
    Medium: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5", 
    Low: "text-green-400 border-green-500/20 bg-green-500/5" 
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
      className="scenario-card border border-white/5 hover:border-purple-500/20"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black mono text-gray-600 bg-white/5 w-6 h-6 flex items-center justify-center rounded-lg">
            {String(i+1).padStart(2, "0")}
          </span>
          <h4 className="font-black text-gray-100 text-sm tracking-tight">{s.title}</h4>
        </div>
        <div className="flex gap-2">
          {s.detection_event?.detected && (
            <span className="text-[8px] px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-black uppercase tracking-widest">
              DETECTED: {s.detection_event.outcome.replace('detected_', '')}
            </span>
          )}
          <span className={`text-[8px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${impactStyles[s.impact] || impactStyles.Medium}`}>
            {s.impact}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium">{s.description}</p>
      
      <div className="flex flex-col gap-2">
        {/* Strategic Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-2">
           {[
             { l: "Cost", v: `${Math.round(s.execution_cost * 100)}%`, i: Zap, c: "text-yellow-500" },
             { l: "Reward", v: `${Math.round(s.expected_reward * 100)}%`, i: Target, c: "text-purple-400" },
             { l: "Risk", v: `${Math.round(s.detection_probability * 100)}%`, i: Eye, c: "text-red-400" },
           ].map(item => (
             <div key={item.l} className="bg-black/20 border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center">
                <item.i className={`w-3 h-3 ${item.c} mb-1`}/>
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">{item.l}</p>
                <p className="text-[10px] font-black text-gray-200">{item.v}</p>
             </div>
           ))}
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-3 mono text-[10px] text-purple-400 flex items-center gap-2 overflow-x-auto">
          <ChevronRight className="w-3 h-3 text-purple-500 shrink-0"/>
          <span className="font-bold uppercase tracking-tighter text-purple-300">Phase:</span>
          <span className="whitespace-nowrap">{s.killchain}</span>
        </div>
        
        <div className="flex items-start gap-3 text-[10px] font-bold text-green-400 bg-green-500/5 border border-green-500/10 rounded-xl p-3">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5"/>
          <div className="leading-relaxed">
            <span className="uppercase text-[8px] block opacity-60 mb-0.5">Control Recommendation:</span>
            {s.mitigation}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
