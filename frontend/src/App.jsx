import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Network, Activity, BrainCircuit, Shield, 
  ShieldCheck, Database, Globe, Key, AlertTriangle, Eye, 
  Clock, GitBranch, Zap, Skull, Search, Info, Settings,
  BarChart3, ChevronRight, LayoutDashboard, Terminal, HelpCircle, X,
  Crosshair, Users, Radar, EyeOff, Swords
} from "lucide-react";

// Components
import RiskGauge from "./components/RiskGauge";
import GraphVisualizer from "./components/GraphVisualizer";
import ScenarioCard from "./components/ScenarioCard";

// Hooks & Constants
import { useSimulation } from "./hooks/useSimulation";
import { 
  PROFILE_ICONS, PROFILE_COLORS, INITIAL_FORM, 
  DEFAULT_PROFILES, DEFAULT_DEFENSES, DEFAULT_OBJECTIVES,
  OBJECTIVE_ICONS, OBJECTIVE_COLORS
} from "./constants";

import "./index.css";

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [profile, setProfile] = useState("osint_attacker");
  const [defenses, setDefenses] = useState([]);
  const [objective, setObjective] = useState("account_takeover");
  const [view, setView] = useState("attacker");
  const [showThinking, setShowThinking] = useState(false);
  const [showStrategic, setShowStrategic] = useState(false);
  const [timeSlider, setTimeSlider] = useState(100);
  const [activeTab, setActiveTab] = useState("simulation");
  const [showAbout, setShowAbout] = useState(false);

  const { 
    results, meta, loading, whatifLoading, error, 
    runSimulation, recomputeWhatIf 
  } = useSimulation();

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSimSubmit = async e => {
    e.preventDefault();
    await runSimulation(form, profile, defenses, objective);
  };

  const toggleDefense = async id => {
    const next = defenses.includes(id) ? defenses.filter(d => d !== id) : [...defenses, id];
    setDefenses(next);
    if (results?.intel) {
      await recomputeWhatIf(results.intel, profile, next, objective);
    }
  };

  const sim = results?.simulation;
  const intel = results?.intel;
  const strat = results?.strategic_analysis;

  const profilesList = meta?.profiles ? Object.values(meta.profiles) : DEFAULT_PROFILES;
  const defensesList = meta?.defenses ? Object.values(meta.defenses) : DEFAULT_DEFENSES;
  const objectivesList = meta?.objectives ? Object.values(meta.objectives) : DEFAULT_OBJECTIVES;

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <ShieldAlert className="text-purple-400 w-6 h-6"/>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">ADIS <span className="text-purple-500">v2.1</span></h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Adaptive Simulator</p>
          </div>
        </div>

        {/* ── What is this? Panel ── */}
        <div className="mb-4">
          <button
            onClick={() => setShowAbout(p => !p)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all text-xs font-bold"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0"/>
            <span>What is this?</span>
            <span className="ml-auto text-purple-500 text-[10px]">{showAbout ? "▲ hide" : "▼ show"}</span>
          </button>

          <AnimatePresence>
            {showAbout && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-4 rounded-xl bg-black/30 border border-white/8 space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="text-white font-black">ADIS</span> simulates how a hacker might try to break into someone's online accounts — so you can see the risks <span className="text-purple-300 font-bold">before</span> a real attack happens.
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">How to use it — 3 simple steps:</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", title: "Enter a target", desc: "Type in an email or username you want to test." },
                      { step: "2", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", title: "Pick a hacker type", desc: "Choose how sophisticated the attacker is — from basic to expert." },
                      { step: "3", color: "text-green-400 bg-green-500/10 border-green-500/20", title: "Hit Execute", desc: "See how the attack would unfold and what defenses stop it." },
                    ].map(({ step, color, title, desc }) => (
                      <div key={step} className={`flex gap-3 p-2.5 rounded-lg border ${color.split(" ").slice(1).join(" ")}`}>
                        <span className={`text-[11px] font-black w-5 h-5 shrink-0 flex items-center justify-center rounded-full border ${color}`}>{step}</span>
                        <div>
                          <p className="text-[11px] font-black text-gray-200">{title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 italic leading-relaxed">
                    ⚠️ This is a <span className="text-gray-400">simulation</span> — no real hacking happens. It uses realistic data to show you your risk level.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="space-y-1 mb-4">
          {[
            { id: "simulation", icon: LayoutDashboard, label: "Simulation" },
            { id: "intelligence", icon: Database, label: "Intelligence" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "settings", icon: Settings, label: "Config" },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"}`}
            >
              <item.icon className="w-4 h-4"/>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6">
          {/* Target Config */}
          <section>
            <h2 className="section-label"><Eye className="w-3 h-3"/>Target Identity</h2>
            <form onSubmit={handleSimSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Identity Endpoint</label>
                <input type="email" name="email" value={form.email} onChange={handleInput} className="app-input" placeholder="target@company.com"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Correlation Alias</label>
                <input type="text" name="username" value={form.username} onChange={handleInput} className="app-input" placeholder="jdoe_admin"/>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Entropy Level</span>
                  <span className={`text-xs font-black mono ${form.passwordEntropy < 40 ? "text-red-400" : form.passwordEntropy < 70 ? "text-yellow-400" : "text-green-400"}`}>
                    {form.passwordEntropy}%
                  </span>
                </div>
                <input type="range" name="passwordEntropy" min="0" max="100" value={form.passwordEntropy} 
                  onChange={e => setForm(p => ({ ...p, passwordEntropy: parseInt(e.target.value) }))} 
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Vector Vulnerability</label>
                {[
                  { n: "reusedPasswords", l: "Credential Reuse", risk: true },
                  { n: "clickedPhishing", l: "Phishing Susceptibility", risk: true },
                  { n: "uses2FA", l: "MFA Enforcement", risk: false }
                ].map(({ n, l, risk }) => (
                  <div key={n} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${form[n] ? "bg-white/5 border-white/10" : "border-transparent opacity-60 hover:opacity-100"}`}
                    onClick={() => setForm(p => ({ ...p, [n]: !p[n] }))}
                  >
                    <span className="text-xs font-medium text-gray-300">{l}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form[n] ? (risk ? "bg-red-500 border-red-400" : "bg-green-500 border-green-400") : "border-gray-700"}`}>
                      {form[n] && <span className="text-[10px] font-bold text-white">✓</span>}
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading || (!form.email && !form.username)} className="btn-primary w-full mt-4">
                {loading ? <><Activity className="animate-spin w-4 h-4"/>Running...</> : <><Network className="w-4 h-4"/>Execute Simulation</>}
              </button>
            </form>
          </section>

          {/* Attacker Profile */}
          <section>
            <h2 className="section-label"><Skull className="w-3 h-3"/>Adversary Profile</h2>
            <div className="space-y-2">
              {profilesList.map(p => {
                const Icon = PROFILE_ICONS[p.id] || Zap;
                const color = PROFILE_COLORS[p.id] || "#6366f1";
                const active = profile === p.id;
                return (
                  <div key={p.id} 
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${active ? "bg-purple-600/10 border-purple-500/40" : "bg-black/20 border-white/5 hover:border-white/10"}`} 
                    onClick={() => setProfile(p.id)}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="p-1.5 rounded-lg" style={{ background: `${color}20` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }}/>
                      </div>
                      <span className="text-xs font-bold text-gray-200">{p.label}</span>
                      <span className="ml-auto text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border border-white/10" style={{ color }}>{p.sophistication}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Attacker Objective */}
          <section>
            <h2 className="section-label"><Crosshair className="w-3 h-3"/>Attacker Objective</h2>
            <div className="space-y-2">
              {objectivesList.map(o => {
                const ObjIcon = OBJECTIVE_ICONS[o.id] || Crosshair;
                const oColor = OBJECTIVE_COLORS[o.id] || "#6366f1";
                const active = objective === o.id;
                return (
                  <div key={o.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${active ? "border-opacity-40" : "bg-black/20 border-white/5 hover:border-white/10"}`}
                    style={active ? { background: `${oColor}10`, borderColor: `${oColor}66` } : {}}
                    onClick={() => setObjective(o.id)}
                  >
                    <div className="p-1.5 rounded-lg" style={{ background: `${oColor}20` }}>
                      <ObjIcon className="w-3.5 h-3.5" style={{ color: oColor }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-200 block">{o.label}</span>
                      <span className="text-[10px] text-gray-500 block truncate">{o.description}</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full border ${active ? "border-opacity-100" : "border-gray-700"}`} style={active ? { background: oColor, borderColor: oColor } : {}}/>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Defenses */}
          <section>
            <h2 className="section-label"><Shield className="w-3 h-3"/>Countermeasures</h2>
            <div className="space-y-2">
              {defensesList.map(d => {
                const active = defenses.includes(d.id);
                return (
                  <div key={d.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${active ? "bg-green-500/10 border-green-500/40" : "bg-black/20 border-white/5 hover:border-white/10"}`} 
                    onClick={() => toggleDefense(d.id)}
                  >
                    <div className={`w-3 h-3 rounded-full border ${active ? "bg-green-500 border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "border-gray-700"}`}/>
                    <span className="text-xs font-medium text-gray-300">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${whatifLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}/>
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{whatifLoading ? "Processing" : "System Ready"}</span>
           </div>
           <Info className="w-3.5 h-3.5 text-gray-600 cursor-help"/>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        {results ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Info */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">
                  <Activity className="w-3.5 h-3.5"/> Simulation Results Generated
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white">Threat Landscape Overview</h1>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">Export JSON</button>
                <button className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold shadow-lg shadow-purple-500/20">Download Report</button>
              </div>
            </div>

            {/* Top Row: Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 glass-panel relative flex items-center justify-center overflow-hidden">
                <div className="risk-glow absolute w-64 h-64 rounded-full" 
                  style={{ background: results.riskScore > 70 ? "#ef4444" : results.riskScore > 40 ? "#f59e0b" : "#10b981" }}
                />
                <RiskGauge score={results.riskScore}/>
              </div>

              <div className="lg:col-span-8 glass-panel">
                <h3 className="section-label"><Terminal className="w-3 h-3"/>Intelligence Metadata</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { l: "Breach Exps", v: `${intel.breachData.length} Records`, color: intel.breachData.length > 0 ? "text-red-400" : "text-green-400" },
                    { l: "OSINT Coverage", v: `${intel.osintData.platforms.length} Platforms`, color: "text-blue-400" },
                    { l: "Evasion Rate", v: `${Math.round(sim.stats.evasion_rate * 100)}%`, color: sim.stats.evasion_rate > 0.7 ? "text-green-400" : "text-red-400" },
                    { l: "Behavior", v: sim.stats.behavior_label, color: "text-purple-400" },
                  ].map(item => (
                    <div key={item.l} className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.l}</p>
                      <p className={`text-lg font-black tracking-tight ${item.color}`}>{item.v}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { l: "Active Vectors", v: sim.stats.activeVectors, icon: Network },
                    { l: "Blocked Vectors", v: sim.stats.blockedNodes, icon: ShieldCheck },
                    { l: "Simulated Nodes", v: sim.stats.totalNodes, icon: GitBranch },
                    { l: "Time to ATO", v: `~${sim.stats.totalEstimatedHours}h`, icon: Clock },
                  ].map(item => (
                    <div key={item.l} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <item.icon className="w-3.5 h-3.5 text-gray-400"/>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-600 uppercase">{item.l}</p>
                        <p className="text-sm font-black text-gray-200">{item.v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Row: Graph */}
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-600/10 border border-purple-500/20">
                    <GitBranch className="text-purple-400 w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Adversarial Chain Analysis</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Interactive Multi-Vector Progression Graph</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl">
                  <button className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === "attacker" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-gray-500"}`} onClick={() => setView("attacker")}>Attacker</button>
                  <button className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === "defender" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-500"}`} onClick={() => setView("defender")}>Defender</button>
                  <div className="w-px h-4 bg-white/10 mx-1"/>
                  <button 
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showThinking ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "text-gray-500"}`} 
                    onClick={() => setShowThinking(!showThinking)}
                  >
                    Thinking
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showStrategic ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "text-gray-500"}`} 
                    onClick={() => setShowStrategic(!showStrategic)}
                  >
                    Strategic
                  </button>
                </div>
              </div>

              {view === "attacker" && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-center gap-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Clock className="w-4 h-4 text-purple-400"/>
                    </div>
                    <span className="text-xs font-black text-purple-300 min-w-[60px]">T+{timeSlider}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={timeSlider} 
                    onChange={e => setTimeSlider(parseInt(e.target.value))} 
                    className="flex-1 h-1.5 bg-purple-500/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                </motion.div>
              )}

              <div className="h-[550px] rounded-2xl border border-white/5 bg-black/40 relative overflow-hidden group">
                <GraphVisualizer 
                  graph={sim.graph} 
                  view={view} 
                  showThinking={showThinking} 
                  showStrategic={showStrategic}
                  timeSlider={timeSlider} 
                  maxTotalTime={sim.stats.maxTotalTime}
                />
                
                <div className="absolute bottom-6 left-6 flex items-center gap-6 p-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"/>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Primary Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-yellow-500"/>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Adaptive Fallback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#10b981]"/>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Mitigated Node</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Modeling Analysis */}
            <AnimatePresence>
              {showStrategic && strat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Attacker Intent */}
                    <div className="glass-panel border-purple-500/20 bg-purple-500/5">
                      <h3 className="section-label"><Radar className="w-3 h-3"/>Adversarial Intent</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                          <Swords className="text-purple-400 w-6 h-6"/>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Objective</p>
                          <h4 className="text-xl font-black text-white">{strat.objective_label}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        The attacker is currently prioritizing paths that maximize <span className="text-purple-300 font-bold">{strat.objective_label.toLowerCase()}</span>. 
                        {strat.pivot_event && (
                          <span className="block mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold italic">
                            STRATEGIC PIVOT: {strat.pivot_event.reason}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Stealth vs Aggression */}
                    <div className="glass-panel border-blue-500/20 bg-blue-500/5">
                      <h3 className="section-label"><EyeOff className="w-3 h-3"/>Behavioral Spectrum</h3>
                      <div className="space-y-6 mt-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strategy Mode</p>
                            <h4 className="text-xl font-black text-white">{strat.behavior_balance.behavior_label}</h4>
                          </div>
                          <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md uppercase">
                            {Math.round(strat.behavior_balance.stealth_score * 100)}% Stealth
                          </span>
                        </div>
                        
                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${strat.behavior_balance.stealth_score * 100}%` }}
                            className="h-full bg-blue-500"
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${strat.behavior_balance.aggression_score * 100}%` }}
                            className="h-full bg-red-500"
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">
                          <span>Covert / Low Noise</span>
                          <span>Overt / High Noise</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost vs Reward */}
                    <div className="glass-panel border-green-500/20 bg-green-500/5">
                      <h3 className="section-label"><Activity className="w-3 h-3"/>Path Efficiency</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-300">Decision Efficiency</p>
                          <span className="text-sm font-black text-green-400">+{Math.round(strat.chosen_path_score * 100)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                              <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Avg Execution Cost</p>
                              <p className="text-sm font-black text-gray-200">Medium</p>
                           </div>
                           <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                              <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Expected Reward</p>
                              <p className="text-sm font-black text-purple-400">High</p>
                           </div>
                        </div>
                        <p className="text-[10px] text-gray-500 italic leading-relaxed">
                          Attacker is selecting nodes with the highest reward-to-risk ratio.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Row: Scenarios & Recommendations */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               {/* Scenarios */}
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <h3 className="text-xl font-black text-white">Scenario Analysis</h3>
                   <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-500">{results.scenarios.length} VECTORS</span>
                 </div>
                 <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[600px] pr-2">
                   {results.scenarios.map((s, i) => (
                     <ScenarioCard key={i} s={s} i={i} />
                   ))}
                 </div>
               </div>

               {/* Recommendations */}
               <div className="space-y-4">
                  <h3 className="text-xl font-black text-white">Strategic Response</h3>
                  <div className="glass-panel border-green-500/20 bg-green-500/5 min-h-[500px] flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                        <ShieldCheck className="text-green-400 w-6 h-6"/>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">Defensive Hardening</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recommended actions to reduce risk score</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="space-y-4">
                         <p className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Critical Priority</p>
                         <ul className="space-y-3">
                           {results.riskScore > 60 && (
                             <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                               <ShieldAlert className="w-5 h-5 text-red-400 shrink-0"/>
                               <div className="text-sm font-medium text-gray-200">Enable Multi-Factor Authentication (MFA) immediately. Current vectors show 2FA bypass attempts are a primary goal.</div>
                             </motion.li>
                           )}
                           {intel.passHygiene.vulnerability === 'Critical' && (
                             <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex gap-4 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                               <Key className="w-5 h-5 text-yellow-400 shrink-0"/>
                               <div className="text-sm font-medium text-gray-200">Password entropy is below threshold. Enforce a rotation of high-entropy secrets and monitor for stuffing attempts.</div>
                             </motion.li>
                           )}
                           <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                             <Search className="w-5 h-5 text-purple-400 shrink-0"/>
                             <div className="text-sm font-medium text-gray-200">OSINT footprint is significant. Recommend a digital privacy scrub to reduce reconnaissance efficacy.</div>
                           </motion.li>
                         </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="flex items-end justify-between mb-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">System Resilience</p>
                        <span className="text-2xl font-black text-green-400">{Math.round((sim.stats.blockedNodes / Math.max(sim.stats.totalNodes, 1)) * 100)}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(sim.stats.blockedNodes / Math.max(sim.stats.totalNodes, 1)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        />
                      </div>
                      <p className="text-[10px] text-gray-600 mt-4 italic font-medium leading-relaxed">
                        "Simulation assumes a persistent adversary. Current coverage mitigates {sim.stats.blockedNodes} out of {sim.stats.totalNodes} identified attack nodes."
                      </p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Decision Log Full Width */}
            <div className="glass-panel">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-800 border border-white/10">
                      <Terminal className="text-gray-400 w-5 h-5"/>
                    </div>
                    <h3 className="text-lg font-black text-white">Adversarial Decision Trace</h3>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Simulation Log</span>
               </div>
               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {sim.decision_trace.map((d, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-purple-500/30 transition-all">
                     <div className="text-[10px] font-black mono text-purple-400 bg-purple-500/10 h-fit px-2 py-1 rounded-lg">STEP {d.step}</div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{d.phase}</span>
                          <span className="text-xs font-black text-red-400">{d.decision}</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{d.reason}</p>
                        {showThinking && d.alternatives?.length > 0 && d.alternatives[0] !== "None" && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                             <span className="text-[8px] font-black text-gray-600 uppercase py-1">Rejected Paths:</span>
                             {d.alternatives.map(alt => (
                               <span key={alt} className="text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">{alt}</span>
                             ))}
                          </div>
                        )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[80vh] flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-[100px] animate-pulse"/>
              <div className="relative w-32 h-32 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                 <ShieldAlert className="w-16 h-16 text-purple-500/50"/>
              </div>
            </div>
            <div className="max-w-md space-y-3">
              <h2 className="text-3xl font-black tracking-tight text-white">System Awaiting Target</h2>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Initialize the adversarial engine by providing target identity parameters in the configuration panel. The simulation will generate an adaptive attack graph based on MITRE ATT&CK methodologies.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl pt-8">
               {[
                 { icon: Database, t: "Breach Intel", d: "Dark web exposure mapping" },
                 { icon: GitBranch, t: "Adaptive Logic", d: "Non-linear attack pathing" },
                 { icon: ShieldCheck, t: "What-If Analysis", d: "Real-time defense validation" },
               ].map(card => (
                 <div key={card.t} className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-purple-600/5 hover:border-purple-500/20 transition-all">
                    <card.icon className="w-6 h-6 text-gray-600 group-hover:text-purple-400 mx-auto mb-4 transition-colors"/>
                    <p className="text-xs font-black text-gray-300 uppercase mb-1">{card.t}</p>
                    <p className="text-[10px] text-gray-600 font-medium">{card.d}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
