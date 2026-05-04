/**
 * Risk Scorer — ADIS v3.0
 * 
 * Now profile-aware, defense-aware, and strategic-aware.
 * Factors in detection evasion rate, objective alignment,
 * and cost-benefit scoring from the strategic engine.
 */

function calculateRiskScore(intel, simulationResult) {
  let base = 10;

  const { stats, profile, strategic_analysis } = simulationResult;

  // 1. Breach exposure
  if (intel.breachData.length > 0) {
    base += intel.breachData.length * 12;
    if (intel.breachData.some(b => b.impact === 'Critical')) base += 25;
    if (intel.breachData.some(b => b.impact === 'High')) base += 10;
  }

  // 2. Password hygiene
  if (intel.passHygiene.vulnerability === 'Critical') base += 28;
  else if (intel.passHygiene.vulnerability === 'Medium') base += 14;

  // 3. Behavioral risk
  base += intel.behaviorRisk.score * 0.4;

  // 4. OSINT footprint
  base += intel.osintData.footprintScore * 0.18;

  // 5. Attacker sophistication multiplier
  const sophisticationMult = {
    'Low': 0.8,
    'Medium': 1.0,
    'Critical': 1.35,
  };
  base *= (sophisticationMult[profile?.sophistication] || 1.0);

  // 6. Active vectors compound risk
  if (stats.activeVectors >= 3) base *= 1.15;
  else if (stats.activeVectors === 2) base *= 1.05;

  // 7. Defense discount - Significantly more impactful
  const defenseDiscount = stats.blockedNodes * 12;
  const coverageBonus = (stats.blockedNodes / Math.max(stats.totalNodes, 1)) * 30;
  base -= (defenseDiscount + coverageBonus);

  // 8. Likelihood modifier
  if (stats.likelihood === 'High') base *= 1.1;
  else if (stats.likelihood === 'Low') base *= 0.5;

  // ── v3.0 Strategic Modifiers ───────────────────────────────────────────────

  // 9. Evasion rate modifier — high evasion = attacker got through undetected = more dangerous
  if (strategic_analysis?.detection_summary) {
    const evasion = strategic_analysis.detection_summary.evasion_rate;
    if (evasion > 0.8) base *= 1.15;        // Very stealthy attack
    else if (evasion > 0.5) base *= 1.05;   // Moderate stealth
    else if (evasion < 0.3) base *= 0.85;   // Most steps detected
  }

  // 10. Strategic path score — higher avg score means attacker found efficient paths
  if (strategic_analysis?.chosen_path_score > 0.3) {
    base *= 1.08;
  } else if (strategic_analysis?.chosen_path_score < -0.1) {
    base *= 0.92; // Attacker had poor options
  }

  // 11. Objective pivot penalty — if the attacker had to pivot, their original plan failed
  if (strategic_analysis?.pivot_event) {
    base *= 0.9; // Slight reduction — forced pivot means defenses worked partially
  }

  // 12. Detection-driven aborts — each abort is a win for defense
  if (strategic_analysis?.detection_summary?.aborted_due_to_detection > 0) {
    base -= strategic_analysis.detection_summary.aborted_due_to_detection * 8;
  }

  return Math.min(Math.max(Math.round(base), 0), 100);
}

module.exports = { calculateRiskScore };
