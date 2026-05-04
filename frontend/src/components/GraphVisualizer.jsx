import React from 'react';
import { ReactFlow, Background, Controls, MarkerType } from "@xyflow/react";
import { Network, Activity, ShieldAlert, Target, Eye, Zap, Search } from "lucide-react";
import "@xyflow/react/dist/style.css";

export default function GraphVisualizer({ graph, view, showThinking, showStrategic, timeSlider, maxTotalTime }) {
  if (!graph?.nodes?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-4">
        <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
          <Network className="w-8 h-8 opacity-20"/>
        </div>
        <p className="text-xs font-black uppercase tracking-widest opacity-40">Awaiting Graph Initialization</p>
      </div>
    );
  }
  
  const currentTime = (timeSlider / 100) * (maxTotalTime || 100);
  
  // Filter nodes that have at least started
  const visibleNodes = graph.nodes.filter(n => n.startTime <= currentTime || n.type === 'target');
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  const phaseX = { Initial: 0, Reconnaissance: 1, Weaponization: 2, Delivery: 2, Exploitation: 3, "Actions on Objectives": 4 };
  const colCount = {};
  visibleNodes.forEach(n => { const c = phaseX[n.phase] ?? 2; colCount[c] = (colCount[c] || 0) + 1; });
  
  const colIdx = {};
  const rfNodes = visibleNodes.map(n => {
    const col = phaseX[n.phase] ?? 2;
    const idx = colIdx[col] = (colIdx[col] || 0);
    colIdx[col]++;
    const total = colCount[col];
    
    const isObjective = n.type === "objective";
    const isTarget = n.type === "target";
    
    // Detection state colors
    const isDetected = n.detection_event?.detected;
    const detectionOutcome = n.detection_event?.outcome; // 'detected_pivot', 'detected_abort', 'detected_persist'
    
    let bg = n.blocked 
      ? "linear-gradient(135deg,#064e3b,#022c22)" 
      : isTarget 
        ? "linear-gradient(135deg,#1e3a8a,#172554)" 
        : isObjective 
          ? "linear-gradient(135deg,#7f1d1d,#450a0a)" 
          : "linear-gradient(135deg,#1e1b4b,#0f172a)";

    if (isDetected && !n.blocked) {
      if (detectionOutcome === 'detected_abort') bg = "linear-gradient(135deg,#450a0a,#2d0606)";
      else bg = "linear-gradient(135deg,#422006,#2d1503)"; // Brownish for pivot/warning
    }
          
    const border = n.blocked ? "#10b981" : isTarget ? "#3b82f6" : isObjective ? "#ef4444" : "#6366f1";
    
    // Calculate progress for this node (0 to 1)
    const nodeDuration = Math.max(n.endTime - n.startTime, 0.1);
    let progress = Math.min(Math.max((currentTime - n.startTime) / nodeDuration, 0), 1);
    if (isNaN(progress)) progress = 1;
    const isComplete = progress === 1;

    return {
      id: n.id,
      position: { x: col * 280 + 60, y: (300 / (total + 1)) * (idx + 1) - 50 },
      data: { label: (
        <div className="font-sans" style={{textAlign: "center", fontSize: "11px", lineHeight: "1.4", position: "relative"}}>
          {n.blocked && view === "defender" && (
            <div style={{fontSize: "8px", color: "#10b981", marginBottom: "4px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em"}}>
              [ MITIGATED ]
            </div>
          )}

          {isDetected && (
            <div style={{
              fontSize: "8px", 
              color: detectionOutcome === 'detected_abort' ? "#ef4444" : "#f59e0b", 
              marginBottom: "4px", 
              fontWeight: 900, 
              textTransform: "uppercase"
            }}>
              [ {detectionOutcome.replace('detected_', '').toUpperCase()} ]
            </div>
          )}

          <div style={{fontWeight: 800, color: isComplete ? "white" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em"}}>
            {n.label}
          </div>
          
          {(view === "attacker" || isComplete) && !n.blocked && n.type !== 'target' && (
             <div style={{fontSize: "9px", color: "rgba(148,163,184,0.6)", marginTop: "4px", fontWeight: 600}}>
               {Math.round(n.successRate * 100)}% SUCCESS PROB
               {showThinking && n.attacker_confidence && (
                 <div style={{color: "#a78bfa", marginTop: "2px", fontWeight: 800}}>
                    CONFIDENCE: {Math.round(n.attacker_confidence * 100)}%
                 </div>
               )}
               {showStrategic && n.strategic_score !== undefined && (
                 <div style={{color: n.strategic_score > 0 ? "#10b981" : "#ef4444", marginTop: "2px", fontWeight: 900}}>
                    STRAT SCORE: {n.strategic_score.toFixed(2)}
                 </div>
               )}
             </div>
          )}

          {showStrategic && n.noise_level && !isTarget && (
            <div className="flex justify-center gap-2 mt-2 opacity-60">
              <span className="text-[7px] font-black uppercase text-gray-500">Noise: {n.noise_level}</span>
            </div>
          )}

          {showThinking && n.justification && n.justification.length > 0 && (
             <div style={{fontSize: "8px", color: "rgba(156,163,175,0.5)", marginTop: "6px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px", textAlign: "left"}}>
               {n.justification.slice(0, 2).map((j, i) => <div key={i} style={{marginBottom: "2px"}}>• {j}</div>)}
             </div>
          )}
          
          {!isComplete && n.type !== 'target' && (
            <div style={{
              position: "absolute", bottom: -12, left: 0, right: 0, height: 2, 
              background: "rgba(255,255,255,0.05)", borderRadius: 1
            }}>
              <div style={{
                height: "100%", width: `${progress * 100}%`, background: border, 
                borderRadius: 1, transition: "width 0.2s", boxShadow: `0 0 10px ${border}40`
              }}/>
            </div>
          )}
        </div>
      )},
      style: { 
        background: bg, 
        border: `1px solid ${border}40`, 
        borderRadius: "14px", 
        padding: "12px 14px", 
        width: (showThinking || showStrategic) ? 240 : 200, 
        boxShadow: `0 10px 25px rgba(0,0,0,0.5), ${n.blocked ? `0 0 20px ${border}20` : "0 0 0 transparent"}`,
        opacity: isNaN(progress) ? 1 : 0.4 + (progress * 0.6),
        transform: `scale(${0.95 + (progress * 0.05)})`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(8px)"
      }
    };
  });

  const rfEdges = graph.edges
    .filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
    .map((e, i) => {
      const sourceNode = graph.nodes.find(n => n.id === e.from);
      const nodeEndTime = sourceNode?.endTime || 0;
      let edgeProgress = Math.min(Math.max((currentTime - nodeEndTime) / 1, 0), 1); 
      if (isNaN(edgeProgress)) edgeProgress = 1;
      
      const color = e.type === "fallback" ? "#f59e0b" : e.type === "blocked" ? "#10b981" : "#ef4444";
      
      return {
        id: `e${i}`, 
        source: e.from, 
        target: e.to, 
        animated: e.type !== "blocked" && edgeProgress > 0 && edgeProgress < 1,
        style: { 
          stroke: color, 
          strokeWidth: 2, 
          strokeDasharray: e.type === "fallback" ? "6,4" : undefined,
          opacity: edgeProgress * 0.6,
          transition: "opacity 0.5s ease"
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: color, width: 20, height: 20 },
        label: e.label, 
        labelStyle: { fill: "#94a3b8", fontSize: "10px", fontWeight: 700, opacity: edgeProgress }, 
        labelBgStyle: { fill: "rgba(10,10,20,0.8)", opacity: edgeProgress, rx: 4 }
      };
    });

  return (
    <ReactFlow 
      nodes={rfNodes} 
      edges={rfEdges} 
      fitView 
      fitViewOptions={{padding: 0.2}} 
      nodesDraggable 
      nodesConnectable={false} 
      attributionPosition="bottom-right"
    >
      <Background color="#1e1b4b" gap={20} size={1} variant="dots"/>
      <Controls showInteractive={false} style={{background: "rgba(15,15,30,0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px"}}/>
    </ReactFlow>
  );
}
