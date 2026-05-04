/**
 * Strategic Models — ADIS v3.0
 * 
 * Core strategic reasoning layer:
 *   - Cost vs Reward decision scoring
 *   - Detection simulation with probabilistic outcomes
 *   - Stealth vs Aggression behavioral modulation
 *   - Multi-objective decision making & mid-attack pivoting
 */

// ── Attacker Objectives ──────────────────────────────────────────────────────

const OBJECTIVES = {
  account_takeover: {
    id: 'account_takeover',
    label: 'Account Takeover',
    description: 'Gain full control of the target identity and associated accounts.',
    priority_nodes: ['credential_stuffing', 'brute_force', 'session_hijack', 'mfa_bypass'],
    reward_multiplier: { credential_stuffing: 1.4, brute_force: 1.3, session_hijack: 1.5, mfa_bypass: 1.6, spear_phishing: 1.1 },
    fallback_objective: 'data_exfiltration',
  },
  data_exfiltration: {
    id: 'data_exfiltration',
    label: 'Data Exfiltration',
    description: 'Extract sensitive PII, credentials, or proprietary data from the target.',
    priority_nodes: ['breach_lookup', 'spear_phishing', 'social_engineering', 'session_hijack'],
    reward_multiplier: { breach_lookup: 1.5, spear_phishing: 1.3, social_engineering: 1.2, session_hijack: 1.4, credential_stuffing: 0.8 },
    fallback_objective: 'social_engineering_spread',
  },
  social_engineering_spread: {
    id: 'social_engineering_spread',
    label: 'Social Engineering Spread',
    description: 'Compromise the target to use them as a pivot for attacking their contacts.',
    priority_nodes: ['spear_phishing', 'social_engineering', 'recon_active'],
    reward_multiplier: { spear_phishing: 1.6, social_engineering: 1.5, recon_active: 1.3, recon_passive: 1.2, credential_stuffing: 0.6 },
    fallback_objective: 'reconnaissance_only',
  },
  reconnaissance_only: {
    id: 'reconnaissance_only',
    label: 'Reconnaissance Only',
    description: 'Gather maximum intelligence on the target without triggering any alerts.',
    priority_nodes: ['recon_passive', 'recon_active', 'breach_lookup'],
    reward_multiplier: { recon_passive: 1.8, recon_active: 1.5, breach_lookup: 1.4, spear_phishing: 0.3, brute_force: 0.1, credential_stuffing: 0.4 },
    fallback_objective: null,
  },
};

// ── Cost-Benefit Decision Engine ─────────────────────────────────────────────

/**
 * Computes the strategic decision score for an attack action.
 * 
 * Formula: decision_score = (expected_reward × attacker_confidence × objective_mult) 
 *                         − (execution_cost × cost_sensitivity + detection_risk × stealth_weight)
 * 
 * All values are dynamically computed — no static lookups.
 */
function computeDecisionScore(nodeTemplate, profile, objective, attackerConfidence, activeDefenses) {
  const objectiveDef = OBJECTIVES[objective] || OBJECTIVES.account_takeover;
  
  // Base reward from the node template (set in config.js)
  const baseReward = nodeTemplate.expected_reward || 0.5;
  
  // Objective alignment multiplier
  const objMult = objectiveDef.reward_multiplier[nodeTemplate.id] || 1.0;
  
  // Expected reward modulated by attacker confidence and objective alignment
  const expectedReward = baseReward * attackerConfidence * objMult;
  
  // Execution cost (time + effort normalized)
  const baseCost = nodeTemplate.execution_cost || 0.5;
  const costSensitivity = 1.0 - (profile.patience === 'Maximum' ? 0.8 : profile.patience === 'High' ? 0.5 : 0.2);
  const executionCost = baseCost * costSensitivity;
  
  // Detection risk modulated by stealth preference
  const baseDetection = nodeTemplate.detection_probability || 0.3;
  const stealthWeight = profile.stealth_weight || 0.5;
  const detectionRisk = baseDetection * stealthWeight;
  
  // Defense amplification of detection risk
  let defenseAmplifier = 1.0;
  activeDefenses.forEach(defId => {
    // If this node is reduced or blocked by the defense, detection risk goes up
    // (the defense is actively monitoring for this type of attack)
    if (nodeTemplate._defenseInteractions?.[defId]) {
      defenseAmplifier += 0.3;
    }
  });
  
  const adjustedDetectionRisk = detectionRisk * defenseAmplifier;
  
  // Aggression bonus — aggressive attackers get a small bonus for high-cost moves
  const aggressionBonus = (profile.aggression_weight || 0.5) * baseCost * 0.15;
  
  // Final score
  const score = (expectedReward + aggressionBonus) - (executionCost + adjustedDetectionRisk);
  
  return {
    decision_score: parseFloat(score.toFixed(4)),
    components: {
      expected_reward: parseFloat(expectedReward.toFixed(4)),
      objective_multiplier: parseFloat(objMult.toFixed(2)),
      execution_cost: parseFloat(executionCost.toFixed(4)),
      detection_risk: parseFloat(adjustedDetectionRisk.toFixed(4)),
      aggression_bonus: parseFloat(aggressionBonus.toFixed(4)),
      defense_amplifier: parseFloat(defenseAmplifier.toFixed(2)),
    }
  };
}

/**
 * Ranks a list of candidate attack nodes by their strategic decision score.
 * Returns them sorted best-to-worst with full scoring breakdown.
 */
function rankCandidateActions(candidates, profile, objective, activeDefenses) {
  const scored = candidates.map(candidate => {
    const confidence = candidate.attacker_confidence || candidate.successRate * 0.7 + Math.random() * 0.1;
    const scoring = computeDecisionScore(candidate, profile, objective, confidence, activeDefenses);
    
    return {
      nodeId: candidate.id,
      label: candidate.label,
      ...scoring,
      attacker_confidence: parseFloat(confidence.toFixed(4)),
    };
  });
  
  // Sort by decision_score descending
  scored.sort((a, b) => b.decision_score - a.decision_score);
  
  return scored;
}

// ── Detection Simulation ─────────────────────────────────────────────────────

/**
 * Simulates whether an attack step is detected by the target's defenses/monitoring.
 * 
 * Returns a detection event with outcome:
 *   - 'undetected' — attacker proceeds normally
 *   - 'detected_pivot' — attacker detects the alarm and pivots to a fallback
 *   - 'detected_abort' — attacker aborts this entire path
 *   - 'detected_persist' — APT-level attacker ignores the alarm and pushes through
 */
function simulateDetection(nodeTemplate, profile, activeDefenses) {
  const baseDetection = nodeTemplate.detection_probability || 0.3;
  const noiseLevel = nodeTemplate.noise_level || 'medium';
  
  // Noise multiplier
  const noiseMult = { low: 0.6, medium: 1.0, high: 1.5 };
  
  // Defense monitoring boost
  let monitoringBoost = 0;
  activeDefenses.forEach(defId => {
    if (nodeTemplate._defenseInteractions?.[defId] === 'monitors') {
      monitoringBoost += 0.15;
    }
  });
  
  const effectiveDetection = Math.min(
    baseDetection * (noiseMult[noiseLevel] || 1.0) + monitoringBoost,
    0.95
  );
  
  const roll = Math.random();
  
  if (roll > effectiveDetection) {
    return {
      detected: false,
      outcome: 'undetected',
      detection_probability: parseFloat(effectiveDetection.toFixed(3)),
      roll: parseFloat(roll.toFixed(3)),
    };
  }
  
  // Detected! Now determine attacker response based on profile
  const persistence = profile.preferences?.persistence || 0.5;
  const stealthWeight = profile.stealth_weight || 0.5;
  
  let outcome;
  const responseRoll = Math.random();
  
  if (persistence > 0.8 && responseRoll < 0.6) {
    // APT-level: push through despite detection
    outcome = 'detected_persist';
  } else if (stealthWeight > 0.6 && responseRoll < 0.7) {
    // Stealthy attacker: abort this path entirely
    outcome = 'detected_abort';
  } else {
    // Default: pivot to alternate path
    outcome = 'detected_pivot';
  }
  
  return {
    detected: true,
    outcome,
    detection_probability: parseFloat(effectiveDetection.toFixed(3)),
    roll: parseFloat(roll.toFixed(3)),
  };
}

// ── Stealth vs Aggression Behavior ───────────────────────────────────────────

/**
 * Computes a behavior profile snapshot showing the attacker's current
 * stealth vs aggression balance, influenced by their profile and what's
 * happened so far in the simulation.
 */
function computeBehaviorBalance(profile, detectionEvents = []) {
  let stealth = profile.stealth_weight || 0.5;
  let aggression = profile.aggression_weight || 0.5;
  
  // Dynamic adjustment: if the attacker has been detected, they shift behavior
  const detectionCount = detectionEvents.filter(e => e.detected).length;
  
  if (detectionCount > 0) {
    // Each detection makes a stealthy attacker MORE stealthy
    // but an aggressive attacker only slightly more cautious
    if (stealth > aggression) {
      stealth = Math.min(stealth + detectionCount * 0.08, 0.95);
      aggression = Math.max(aggression - detectionCount * 0.05, 0.05);
    } else {
      stealth = Math.min(stealth + detectionCount * 0.03, 0.7);
      aggression = Math.max(aggression - detectionCount * 0.02, 0.3);
    }
  }
  
  const total = stealth + aggression;
  
  return {
    stealth_score: parseFloat((stealth / total).toFixed(3)),
    aggression_score: parseFloat((aggression / total).toFixed(3)),
    stealth_raw: parseFloat(stealth.toFixed(3)),
    aggression_raw: parseFloat(aggression.toFixed(3)),
    behavior_label: stealth > aggression ? 'Covert' : stealth === aggression ? 'Balanced' : 'Aggressive',
    detection_influence: detectionCount,
  };
}

// ── Multi-Objective Pivot Logic ──────────────────────────────────────────────

/**
 * Evaluates whether an attacker should pivot to a different objective
 * mid-simulation based on blocked paths and available options.
 * 
 * Returns null if no pivot needed, or the new objective if pivoting.
 */
function evaluateObjectivePivot(currentObjective, blockedNodes, availableNodes, profile) {
  const objectiveDef = OBJECTIVES[currentObjective];
  if (!objectiveDef) return null;
  
  // Count how many priority nodes for the current objective are blocked
  const priorityBlocked = objectiveDef.priority_nodes.filter(n => blockedNodes.includes(n)).length;
  const priorityTotal = objectiveDef.priority_nodes.length;
  const blockRatio = priorityBlocked / Math.max(priorityTotal, 1);
  
  // Threshold for pivoting depends on attacker patience
  const pivotThreshold = profile.patience === 'Maximum' ? 0.8 : profile.patience === 'High' ? 0.6 : 0.4;
  
  if (blockRatio < pivotThreshold) return null; // Still viable, keep going
  
  // Check if fallback objective exists and is viable
  const fallback = objectiveDef.fallback_objective;
  if (!fallback) return null;
  
  const fallbackDef = OBJECTIVES[fallback];
  if (!fallbackDef) return null;
  
  // Check if the fallback objective has viable paths
  const fallbackViable = fallbackDef.priority_nodes.filter(n => !blockedNodes.includes(n) && availableNodes.includes(n));
  
  if (fallbackViable.length > 0) {
    return {
      new_objective: fallback,
      reason: `${Math.round(blockRatio * 100)}% of priority vectors for "${objectiveDef.label}" are blocked. Pivoting to "${fallbackDef.label}" — ${fallbackViable.length} viable paths remain.`,
      block_ratio: parseFloat(blockRatio.toFixed(2)),
      viable_fallback_paths: fallbackViable.length,
    };
  }
  
  return null;
}

// ── Strategic Path Analysis ──────────────────────────────────────────────────

/**
 * Produces a strategic_analysis object summarizing the attacker's
 * overall strategic picture for inclusion in simulation results.
 */
function buildStrategicAnalysis(chosenPath, rejectedPaths, objective, pivotEvent, behaviorBalance, detectionLog) {
  const totalDetections = detectionLog.filter(e => e.detected).length;
  const totalAborts = detectionLog.filter(e => e.outcome === 'detected_abort').length;
  const totalPersists = detectionLog.filter(e => e.outcome === 'detected_persist').length;
  
  return {
    objective: objective,
    objective_label: (OBJECTIVES[objective] || {}).label || objective,
    chosen_path_score: chosenPath.reduce((sum, p) => sum + (p.decision_score || 0), 0) / Math.max(chosenPath.length, 1),
    chosen_path: chosenPath,
    rejected_paths: rejectedPaths.slice(0, 10), // Cap for payload size
    pivot_event: pivotEvent,
    behavior_balance: behaviorBalance,
    detection_summary: {
      total_steps_evaluated: detectionLog.length,
      total_detections: totalDetections,
      aborted_due_to_detection: totalAborts,
      persisted_through_detection: totalPersists,
      undetected_steps: detectionLog.length - totalDetections,
      evasion_rate: parseFloat(((detectionLog.length - totalDetections) / Math.max(detectionLog.length, 1)).toFixed(3)),
    },
    detection_log: detectionLog,
  };
}

module.exports = {
  OBJECTIVES,
  computeDecisionScore,
  rankCandidateActions,
  simulateDetection,
  computeBehaviorBalance,
  evaluateObjectivePivot,
  buildStrategicAnalysis,
};
