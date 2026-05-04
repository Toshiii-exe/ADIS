/**
 * Attack Graph Engine — ADIS v3.0
 * Thin orchestration layer for backward compatibility.
 * Now passes objective through to the strategic simulation engine.
 */

const { runAdaptiveSimulation } = require('./simulationEngine');
const { OBJECTIVES } = require('./strategicModels');

/**
 * @param {object} intel          - Output from intelligence modules
 * @param {string} profileId      - Attacker profile ID
 * @param {string[]} defenses     - Active defensive controls
 * @param {string} [objective]    - Attacker objective: 'account_takeover' | 'data_exfiltration' | 'social_engineering_spread' | 'reconnaissance_only'
 */
function simulateAttackGraph(intel, profileId = 'osint_attacker', defenses = [], objective = null) {
  const result = runAdaptiveSimulation(intel, profileId, defenses, objective);
  return result;
}

module.exports = { simulateAttackGraph, OBJECTIVES };
