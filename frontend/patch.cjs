const fs = require('fs');
let content = fs.readFileSync('c:/Users/santh/OneDrive/Desktop/New folder (2)/frontend/src/App.jsx', 'utf8');

// 3. Update GraphVisualizer JSX to show confidence and justification
let oldLabel = `<div style={{fontSize:"9px",color:"#94a3b8",marginTop:"2px"}}>{Math.round(n.successRate*100)}%   {n.timeHours}h</div>`;
let newLabel = `<div style={{fontSize:"9px",color:"#94a3b8",marginTop:"2px"}}>
            Prob: {Math.round(n.successRate*100)}% | Time: {n.timeHours}h
            {showThinking && n.attacker_confidence && (
              <div style={{color:"#a78bfa", marginTop:"2px", fontWeight:600}}>Conf: {Math.round(n.attacker_confidence*100)}%</div>
            )}
            {showThinking && n.justification && n.justification.length > 0 && (
              <div style={{fontSize:"8px", color:"#9ca3af", marginTop:"4px", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"4px", textAlign:"left"}}>
                {n.justification.map((j, i) => <div key={i}>• {j}</div>)}
              </div>
            )}
          </div>`;
content = content.replace(oldLabel, newLabel);

// 4. Update GraphVisualizer node style width
content = content.replace(
  'padding:"8px 10px", width:170, boxShadow',
  'padding:"8px 10px", width:showThinking?220:170, boxShadow'
);

// 5. Update GraphVisualizer usage in App
content = content.replace(
  '<GraphVisualizer graph={sim.graph} view={view}/>',
  '<GraphVisualizer graph={sim.graph} view={view} showThinking={showThinking}/>'
);

// 6. Add Show Attacker Thinking toggle in view-toggle
let oldToggle = `<button className={\`view-toggle-btn \${view==="defender"?"active-defender":""}\`} onClick={()=>setView("defender")}><Shield className="w-3.5 h-3.5 mr-1"/>Defender View</button>
                  </div>`;
let newToggle = `<button className={\`view-toggle-btn \${view==="defender"?"active-defender":""}\`} onClick={()=>setView("defender")}><Shield className="w-3.5 h-3.5 mr-1"/>Defender View</button>
                    <button className={\`view-toggle-btn \${showThinking?"active-attacker":""}\`} style={{marginLeft:"8px", borderColor:showThinking?"#a78bfa":""}} onClick={()=>setShowThinking(!showThinking)}><BrainCircuit className="w-3.5 h-3.5 mr-1"/>Show Attacker Thinking</button>
                  </div>`;
content = content.replace(oldToggle, newToggle);

// 7. Update Attacker Decision Log rendering
let oldDecisionLog = `{sim.decisionLog?.length>0&&(
                <div className="panel">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="w-3.5 h-3.5"/>Attacker Decision Log</h3>
                  <div>
                    {sim.decisionLog.map((d,i)=>(
                      <div key={i} className="decision-entry">
                        <span className="decision-phase">{d.phase}</span>
                        <p className="text-sm text-gray-400 leading-relaxed">{d.decision}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}`;
              
let newDecisionLog = `{sim.decision_trace?.length>0&&(
                <div className="panel">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="w-3.5 h-3.5"/>Attacker Decision Log</h3>
                  <div className="space-y-3">
                    {sim.decision_trace.map((d,i)=>(
                      <div key={i} className="decision-entry p-3 bg-black/20 border border-white/5 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <span className="text-xs mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Step {d.step}</span>
                             <span className="decision-phase">{d.phase}</span>
                           </div>
                           <span className="text-xs font-semibold text-gray-300">Action: {d.decision}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2 leading-relaxed">{d.reason}</p>
                        {showThinking && d.alternatives && d.alternatives.length > 0 && d.alternatives[0] !== "None" && (
                          <div className="text-[10px] text-gray-500 mt-2 border-t border-white/5 pt-2">
                            <strong>Considered & Skipped:</strong> {d.alternatives.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}`;
content = content.replace(oldDecisionLog, newDecisionLog);

// 8. Render Skipped Attacks
let skippedAttacksSection = `
              {/* Skipped Attacks */}
              {showThinking && sim.skipped_attacks?.length>0&&(
                <div className="panel border-dashed border-orange-500/20">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-orange-400"/>Skipped Attack Paths</h3>
                  <div className="space-y-2">
                    {sim.skipped_attacks.map((s,i)=>(
                      <div key={i} className="flex flex-col py-2 px-3 bg-orange-950/10 border border-orange-900/20 rounded-lg">
                        <span className="font-semibold text-orange-300 text-xs mb-1">{s.attack}</span>
                        <span className="text-xs text-gray-500 leading-relaxed">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}`;
content = content.replace('              {/* Attacker Decision Log */}', skippedAttacksSection + '\n\n              {/* Attacker Decision Log */}');

// 9. Fix imports to include BrainCircuit
content = content.replace('Activity, Search', 'Activity, Search, BrainCircuit');

fs.writeFileSync('c:/Users/santh/OneDrive/Desktop/New folder (2)/frontend/src/App.jsx', content);
console.log('App.jsx modified successfully!');
