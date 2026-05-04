/**
 * Strategic Simulation Engine — ADIS v3.0
 * 
 * Orchestrates adaptive attack graph generation using:
 *   - Cost vs Reward decision scoring (dynamic, not static)
 *   - Detection simulation with probabilistic outcomes
 *   - Stealth vs Aggression behavioral modulation
 *   - Multi-objective decision making & mid-attack pivoting
 *   - Per-methodology strategic graph building
 */

const { getProfile } = require('./attackerProfiles');
const { NODE_TEMPLATES, DEFENSES } = require('./config');
const {
  OBJECTIVES,
  computeDecisionScore,
  rankCandidateActions,
  simulateDetection,
  computeBehaviorBalance,
  evaluateObjectivePivot,
  buildStrategicAnalysis,
} = require('./strategicModels');

// ─── Core Helpers ────────────────────────────────────────────────────────────

const chance = (prob) => Math.random() <= prob;

const isBlocked = (nodeId, activeDefenses) => {
  for (const defId of activeDefenses) {
    const d = DEFENSES[defId];
    if (d?.blocks?.includes(nodeId)) return { blocked: true, defense: d };
  }
  return { blocked: false };
};

const computeSuccessRate = (nodeId, profile, activeDefenses) => {
  const template = NODE_TEMPLATES[nodeId];
  if (!template) return 0;

  const prefMap = {
    brute_force: 'bruteForce',
    credential_stuffing: 'credentialStuffing',
    spear_phishing: 'phishing',
    recon_passive: 'osint',
    recon_active: 'osint',
    social_engineering: 'socialEngineering',
    persistence: 'persistence',
    mfa_bypass: 'mfaBypass',
  };

  let rate = template.baseSuccessRate;
  const prefKey = prefMap[nodeId];
  if (prefKey && profile.preferences[prefKey] !== undefined) {
    rate *= (0.4 + profile.preferences[prefKey] * 0.7);
  }

  for (const defId of activeDefenses) {
    const d = DEFENSES[defId];
    if (d?.reduces?.includes(nodeId)) rate *= 0.35;
  }

  return Math.min(Math.max(rate, 0.02), 0.97);
};

const generateJustification = (nodeId, intel) => {
  const reasons = [];
  const { osintData, breachData, behaviorRisk, passHygiene } = intel;

  switch (nodeId) {
    case 'recon_active':
      if (osintData.platforms?.length > 0) reasons.push(`Broad digital footprint across ${osintData.platforms.length} platforms.`);
      if (osintData.footprintScore > 10) reasons.push('High footprint score invites active enumeration.');
      break;
    case 'breach_lookup':
      if (breachData?.length > 0) reasons.push(`${breachData.length} records found in dark web dumps.`);
      break;
    case 'credential_stuffing':
      reasons.push('Leveraging leaked credential pairs directly against target portals.');
      if (behaviorRisk?.answers?.reusedPasswords) reasons.push('Target behavior profile shows high likelihood of password reuse.');
      break;
    case 'brute_force':
      if (passHygiene?.vulnerability === 'Critical') reasons.push('Low password entropy detected or inferred.');
      reasons.push('Automated password spray is viable based on expected target defenses.');
      break;
    case 'spear_phishing':
      if (osintData.platforms?.length >= 2) reasons.push('Rich OSINT profile provides material for a highly targeted lure.');
      if (behaviorRisk?.susceptibility === 'High') reasons.push('Target exhibits high susceptibility to phishing attacks.');
      break;
    case 'mfa_bypass':
      reasons.push('MFA presence requires advanced interception (AiTM or SIM-swap).');
      break;
    default:
      reasons.push('Standard tactical progression based on profile methodology.');
  }
  return reasons;
};

// ─── Simulation State Manager ────────────────────────────────────────────────

class SimulationSession {
  constructor(intel, profile, activeDefenses, objective) {
    this.intel = intel;
    this.profile = profile;
    this.activeDefenses = activeDefenses;
    this.objective = objective;
    this.nodes = new Map();
    this.edges = [];
    this.decisionTrace = [];
    this.skippedAttacks = [];
    this.stepCounter = 1;
    
    // Strategic tracking
    this.detectionLog = [];
    this.chosenPathScores = [];
    this.rejectedPathScores = [];
    this.pivotEvent = null;
    this.currentObjective = objective;
  }

  addNode(id) {
    if (this.nodes.has(id)) return this.nodes.get(id);
    
    const template = NODE_TEMPLATES[id];
    const blockStatus = isBlocked(id, this.activeDefenses);
    const successRate = blockStatus.blocked ? 0 : parseFloat(computeSuccessRate(id, this.profile, this.activeDefenses).toFixed(2));
    const timeHours = Math.round(template.timeHours * this.profile.timeMultiplier);
    const confidence = parseFloat(Math.min(Math.max(successRate * 0.7 + (Math.random() * 0.1), 0.05), 0.99).toFixed(2));
    
    // Compute strategic score for this node
    const scoring = blockStatus.blocked ? null : computeDecisionScore(
      template, this.profile, this.currentObjective, confidence, this.activeDefenses
    );
    
    // Run detection simulation for non-blocked, non-target nodes
    let detectionEvent = null;
    if (!blockStatus.blocked && template.type !== 'target') {
      detectionEvent = simulateDetection(template, this.profile, this.activeDefenses);
      this.detectionLog.push({ nodeId: id, ...detectionEvent });
    }
    
    const node = {
      ...template,
      timeHours,
      successRate,
      attacker_confidence: confidence,
      justification: generateJustification(id, this.intel),
      blocked: blockStatus.blocked,
      blockedBy: blockStatus.blocked ? blockStatus.defense.label : null,
      breakpointLabel: blockStatus.blocked ? blockStatus.defense.breakpointLabel : null,
      defenseColor: blockStatus.blocked ? blockStatus.defense.color : null,
      startTime: 0,
      endTime: timeHours,
      // Strategic properties
      strategic_score: scoring ? scoring.decision_score : null,
      score_components: scoring ? scoring.components : null,
      detection_event: detectionEvent,
      detection_probability: template.detection_probability,
      noise_level: template.noise_level,
      execution_cost: template.execution_cost,
      expected_reward: template.expected_reward,
    };
    
    this.nodes.set(id, node);
    return node;
  }

  link(from, to, opts = {}) {
    if (this.edges.find(e => e.from === from && e.to === to)) return;
    this.edges.push({
      from, to,
      type: opts.type || 'primary',
      label: opts.label || null,
      probability: opts.probability !== undefined ? parseFloat(opts.probability.toFixed(2)) : null,
    });
  }

  logDecision(phase, decision, alternatives, reason) {
    this.decisionTrace.push({ step: this.stepCounter++, phase, decision, alternatives, reason });
  }

  skip(attackId, reason) {
    this.skippedAttacks.push({ attack: attackId, reason });
  }
  
  /**
   * Strategic action selection — replaces hardcoded chance() calls.
   * Given a list of candidate node IDs, ranks them by decision score,
   * selects the top-N, and records rejected alternatives.
   */
  strategicSelect(candidateIds, maxSelections = 2) {
    const candidates = candidateIds
      .map(id => NODE_TEMPLATES[id])
      .filter(Boolean);
    
    const ranked = rankCandidateActions(candidates, this.profile, this.currentObjective, this.activeDefenses);
    
    const selected = [];
    const rejected = [];
    
    ranked.forEach((scored, idx) => {
      // Check if blocked first
      const blockStatus = isBlocked(scored.nodeId, this.activeDefenses);
      
      if (idx < maxSelections && scored.decision_score > -0.3 && !blockStatus.blocked) {
        selected.push(scored);
        this.chosenPathScores.push(scored);
      } else {
        const rejectReason = blockStatus.blocked 
          ? `Blocked by defense` 
          : scored.decision_score <= -0.3 
            ? `Score too low (${scored.decision_score.toFixed(3)})` 
            : `Lower priority (rank #${idx + 1})`;
        
        rejected.push({ ...scored, reject_reason: rejectReason });
        this.rejectedPathScores.push({ ...scored, reject_reason: rejectReason });
      }
    });
    
    return { selected, rejected, all: ranked };
  }
  
  /**
   * Check whether the attacker should pivot objectives mid-simulation.
   */
  checkObjectivePivot() {
    const blockedIds = [...this.nodes.values()].filter(n => n.blocked).map(n => n.id);
    const allNodeIds = Object.keys(NODE_TEMPLATES);
    
    const pivot = evaluateObjectivePivot(this.currentObjective, blockedIds, allNodeIds, this.profile);
    
    if (pivot) {
      this.pivotEvent = pivot;
      this.currentObjective = pivot.new_objective;
      this.logDecision(
        'Strategic Pivot', 
        `objective_change → ${pivot.new_objective}`, 
        [this.objective],
        pivot.reason
      );
    }
    
    return pivot;
  }

  getResults() {
    const allNodes = [...this.nodes.values()];
    const maxTotalTime = this.computeTimings(allNodes);
    const totalTime = allNodes.filter(n => !n.blocked && n.type !== 'target').reduce((acc, n) => acc + n.timeHours, 0);
    const viableExploits = allNodes.filter(n => ['Exploitation', 'Delivery'].includes(n.phase) && !n.blocked);
    
    // Build behavior balance
    const behaviorBalance = computeBehaviorBalance(this.profile, this.detectionLog);
    
    // Build strategic analysis
    const strategicAnalysis = buildStrategicAnalysis(
      this.chosenPathScores,
      this.rejectedPathScores,
      this.currentObjective,
      this.pivotEvent,
      behaviorBalance,
      this.detectionLog,
    );

    return {
      graph: { nodes: allNodes, edges: this.edges },
      decision_trace: this.decisionTrace,
      skipped_attacks: this.skippedAttacks,
      profile: this.profile,
      objective: this.currentObjective,
      original_objective: this.objective,
      strategic_analysis: strategicAnalysis,
      stats: {
        totalEstimatedHours: totalTime,
        maxTotalTime,
        activeVectors: viableExploits.length,
        blockedNodes: allNodes.filter(n => n.blocked).length,
        totalNodes: allNodes.length,
        attackPaths: this.countPaths('target', ['account_takeover', 'data_exfil', 'lateral_movement', 'persistence']),
        likelihood: viableExploits.length > 2 ? 'High' : viableExploits.length > 0 ? 'Medium' : 'Low',
        evasion_rate: strategicAnalysis.detection_summary.evasion_rate,
        behavior_label: behaviorBalance.behavior_label,
      }
    };
  }

  computeTimings(nodes) {
    const inDegree = new Map();
    nodes.forEach(n => inDegree.set(n.id, 0));
    this.edges.forEach(e => inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1));

    const queue = nodes.filter(n => inDegree.get(n.id) === 0).map(n => n.id);
    nodes.forEach(n => { n.startTime = 0; n.endTime = n.timeHours; });

    while (queue.length > 0) {
      const uId = queue.shift();
      const u = this.nodes.get(uId);
      this.edges.filter(e => e.from === uId).forEach(e => {
        const v = this.nodes.get(e.to);
        if (v) {
          v.startTime = Math.max(v.startTime, u.endTime);
          v.endTime = v.startTime + v.timeHours;
          inDegree.set(e.to, inDegree.get(e.to) - 1);
          if (inDegree.get(e.to) === 0) queue.push(e.to);
        }
      });
    }
    return Math.max(...nodes.map(n => n.endTime), 1);
  }

  countPaths(from, targets) {
    let count = 0;
    const visit = (nodeId, visited) => {
      if (targets.includes(nodeId)) { count++; return; }
      const next = this.edges.filter(e => e.from === nodeId && !visited.has(e.to) && e.type !== 'blocked');
      next.forEach(e => {
        visited.add(e.to);
        visit(e.to, visited);
        visited.delete(e.to);
      });
    };
    visit(from, new Set([from]));
    return count;
  }
}

// ─── Strategic Methodology Implementations ───────────────────────────────────

const METHODOLOGIES = {
  script_kiddie: (session) => {
    session.addNode('target');
    session.addNode('recon_passive');
    session.link('target', 'recon_passive', { label: 'Initiate OSINT' });
    session.logDecision('Reconnaissance', 'recon_passive', [], 'Gathering basic target information from public sources.');

    const hasBreach = session.intel.breachData.length > 0;
    if (hasBreach) {
      session.addNode('breach_lookup');
      session.link('recon_passive', 'breach_lookup', { label: 'Breach Check' });
    }
    
    // Strategic selection: rank exploitation vectors by cost-benefit
    const exploitCandidates = hasBreach 
      ? ['credential_stuffing', 'brute_force'] 
      : ['brute_force'];
    
    const { selected, rejected } = session.strategicSelect(exploitCandidates, 1);
    
    if (selected.length > 0) {
      const chosenId = selected[0].nodeId;
      const node = session.addNode(chosenId);
      const fromNode = hasBreach ? 'breach_lookup' : 'recon_passive';
      session.link(fromNode, chosenId, { type: node.blocked ? 'blocked' : 'primary' });
      
      const altLabels = rejected.map(r => r.label);
      session.logDecision('Exploitation', chosenId, altLabels, 
        `Selected via strategic scoring (score: ${selected[0].decision_score.toFixed(3)}). ${selected[0].components ? `Reward: ${selected[0].components.expected_reward.toFixed(2)}, Cost: ${selected[0].components.execution_cost.toFixed(2)}` : ''}`
      );
      
      // Handle detection event
      if (node.detection_event?.detected && node.detection_event.outcome === 'detected_abort') {
        session.logDecision('Detection', `${chosenId}_detected`, [], 
          `Attack detected (p=${node.detection_event.detection_probability}). Aborting path.`);
      } else if (node.blocked || (node.detection_event?.detected && node.detection_event.outcome === 'detected_pivot')) {
        // Fallback: try social engineering as a low-sophistication pivot
        if (chance(0.4)) {
          session.addNode('social_engineering');
          session.link(chosenId, 'social_engineering', { type: 'fallback' });
          session.logDecision('Delivery', 'social_engineering', [], 
            `Primary vector ${node.blocked ? 'blocked' : 'detected'}; resorting to low-sophistication social engineering.`);
        }
      }
    } else {
      // Everything was rejected/blocked
      if (!hasBreach) session.skip('credential_stuffing', 'No breach data available to build a credential list.');
      rejected.forEach(r => session.skip(r.nodeId, r.reject_reason));
    }
  },

  osint_attacker: (session) => {
    session.addNode('target');
    session.addNode('recon_passive');
    session.link('target', 'recon_passive');
    session.logDecision('Reconnaissance', 'recon_passive', [], 'Analyzing target profile.');

    // Strategic decision: active recon vs skip
    const reconSelection = session.strategicSelect(['recon_active'], 1);
    let reconSrc = 'recon_passive';
    
    if (reconSelection.selected.length > 0 && reconSelection.selected[0].decision_score > -0.1) {
      session.addNode('recon_active');
      session.link('recon_passive', 'recon_active');
      reconSrc = 'recon_active';
      session.logDecision('Reconnaissance', 'recon_active', [], 
        `Deep diving — strategic score: ${reconSelection.selected[0].decision_score.toFixed(3)}.`);
    }

    // Strategic selection: rank delivery/exploitation vectors
    const deliveryCandidates = ['spear_phishing', 'social_engineering', 'credential_stuffing'];
    const { selected, rejected } = session.strategicSelect(deliveryCandidates, 2);
    
    selected.forEach((scored, idx) => {
      const node = session.addNode(scored.nodeId);
      const linkType = node.blocked ? 'blocked' : idx === 0 ? 'primary' : 'fallback';
      session.link(reconSrc, scored.nodeId, { type: linkType });
      
      const altLabels = rejected.map(r => r.label);
      session.logDecision(
        node.phase === 'Delivery' ? 'Delivery' : 'Exploitation', 
        scored.nodeId, 
        idx === 0 ? altLabels : [],
        `Strategic score: ${scored.decision_score.toFixed(3)}. Objective: ${session.currentObjective}. ${idx > 0 ? 'Secondary vector.' : 'Primary vector.'}`
      );
      
      // Handle detection
      if (node.detection_event?.detected) {
        if (node.detection_event.outcome === 'detected_abort') {
          session.logDecision('Detection', `${scored.nodeId}_abort`, [],
            `Detected (p=${node.detection_event.detection_probability}). Stealth-oriented attacker aborting this path.`);
        } else if (node.detection_event.outcome === 'detected_pivot') {
          session.logDecision('Detection', `${scored.nodeId}_pivot`, [],
            `Detected. Pivoting to alternate vector.`);
        }
      }
    });
    
    // Mid-attack objective pivot check
    session.checkObjectivePivot();
  },

  advanced_persistent: (session) => {
    session.addNode('target');
    session.addNode('recon_passive');
    session.link('target', 'recon_passive');
    session.addNode('recon_active');
    session.link('recon_passive', 'recon_active');
    session.logDecision('Reconnaissance', 'recon_active', [], 'Full-spectrum reconnaissance initiated.');

    // Strategic selection: rank ALL exploitation vectors, select top 3
    const allCandidates = ['session_hijack', 'spear_phishing', 'credential_stuffing', 'brute_force', 'social_engineering'];
    const { selected, rejected } = session.strategicSelect(allCandidates, 3);
    
    let primaryExploit = null;
    
    selected.forEach((scored, idx) => {
      const node = session.addNode(scored.nodeId);
      const linkType = node.blocked ? 'blocked' : 'primary';
      session.link('recon_active', scored.nodeId, { type: linkType });
      if (!node.blocked && !primaryExploit) primaryExploit = scored.nodeId;
      
      // APT handles detection differently — persists through it
      if (node.detection_event?.detected) {
        if (node.detection_event.outcome === 'detected_persist') {
          session.logDecision('Detection', `${scored.nodeId}_persist`, [],
            `Detected (p=${node.detection_event.detection_probability}), but persisting — APT-level patience.`);
        } else if (node.detection_event.outcome === 'detected_pivot') {
          session.logDecision('Detection', `${scored.nodeId}_pivot`, [],
            `Detected. Adapting strategy while maintaining other vectors.`);
        }
      }
    });
    
    const rejectedLabels = rejected.map(r => `${r.label} (${r.reject_reason})`);
    session.logDecision('Exploitation', 'parallel_attack', rejectedLabels, 
      `Launching ${selected.length} simultaneous vectors. Strategic ranking applied based on cost-benefit analysis.`);

    // Advanced Pivot logic — MFA bypass when credential paths are blocked
    const credBlocked = session.nodes.get('credential_stuffing')?.blocked;
    const sessBlocked = session.nodes.get('session_hijack')?.blocked;
    
    if (credBlocked || sessBlocked) {
      const mfaSelection = session.strategicSelect(['mfa_bypass'], 1);
      if (mfaSelection.selected.length > 0) {
        const mfa = session.addNode('mfa_bypass');
        if (session.nodes.has('session_hijack')) session.link('session_hijack', 'mfa_bypass', { type: 'fallback' });
        if (session.nodes.has('credential_stuffing')) session.link('credential_stuffing', 'mfa_bypass', { type: 'fallback' });
        session.logDecision('Exploitation', 'mfa_bypass', [], 
          `Primary vectors blocked by auth controls. MFA bypass score: ${mfaSelection.selected[0].decision_score.toFixed(3)}. Orchestrating AiTM/SIM-swap proxy.`);
      }
    }
    
    // Mid-attack objective pivot check
    session.checkObjectivePivot();
  }
};

// ─── Main Export ─────────────────────────────────────────────────────────────

function runAdaptiveSimulation(intel, profileId, activeDefenses = [], objective = null) {
  const profile = getProfile(profileId);
  
  // Resolve objective: use provided, or fall back to profile default
  const resolvedObjective = objective || profile.default_objective || 'account_takeover';
  
  const session = new SimulationSession(intel, profile, activeDefenses, resolvedObjective);
  
  // 1. Run profile methodology with strategic decision-making
  const method = METHODOLOGIES[profileId] || METHODOLOGIES.osint_attacker;
  method(session);

  // 2. Automated Post-Exploitation phase
  const viableExploits = [...session.nodes.values()].filter(n => 
    ['Exploitation', 'Delivery'].includes(n.phase) && !n.blocked
  );
  
  // Filter out nodes that were aborted due to detection
  const activeExploits = viableExploits.filter(n => 
    !n.detection_event?.detected || n.detection_event.outcome !== 'detected_abort'
  );
  
  if (activeExploits.length > 0) {
    // Post-exploitation based on final objective
    const finalObj = session.currentObjective;
    
    if (finalObj === 'account_takeover' || finalObj === 'data_exfiltration' || finalObj === 'social_engineering_spread') {
      session.addNode('account_takeover');
      activeExploits.forEach(n => session.link(n.id, 'account_takeover', { probability: n.successRate }));
    }
    
    if (finalObj === 'data_exfiltration' || finalObj === 'account_takeover') {
      session.addNode('data_exfil');
      if (session.nodes.has('account_takeover')) {
        session.link('account_takeover', 'data_exfil');
      } else {
        activeExploits.forEach(n => session.link(n.id, 'data_exfil', { probability: n.successRate * 0.7 }));
      }
    }

    if (finalObj === 'social_engineering_spread') {
      session.addNode('lateral_movement');
      if (session.nodes.has('account_takeover')) {
        session.link('account_takeover', 'lateral_movement');
      }
    }

    if (chance(profile.preferences.persistence || 0.5)) {
      session.addNode('persistence');
      if (session.nodes.has('account_takeover')) {
        session.link('account_takeover', 'persistence');
      }
    }

    if (profile.id === 'advanced_persistent') {
      session.addNode('lateral_movement');
      if (session.nodes.has('account_takeover')) {
        session.link('account_takeover', 'lateral_movement');
      }
    }
  } else if (viableExploits.length > 0) {
    session.logDecision('Result', 'partial_termination', [], 
      'Exploitation vectors exist but were aborted due to detection. Attacker retreated.');
  } else {
    session.logDecision('Result', 'termination', [], 'All vectors blocked by active defenses.');
  }

  return session.getResults();
}

module.exports = { runAdaptiveSimulation };
