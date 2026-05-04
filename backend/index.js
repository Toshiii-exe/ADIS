const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { simulateAttackGraph, OBJECTIVES } = require('./engine/attackGraphEngine');
const { calculateRiskScore } = require('./engine/riskScorer');
const { ATTACKER_PROFILES } = require('./engine/attackerProfiles');
const { DEFENSES } = require('./engine/config');
const {
  simulateBreachExposure,
  simulateOSINT,
  checkPasswordHygiene,
  assessBehavioralRisk,
} = require('./modules/intelligence');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── GET /api/meta ─────────────────────────────────────────────────────────────
// Returns available attacker profiles, defense options, and objectives for the UI
app.get('/api/meta', (req, res) => {
  res.json({ profiles: ATTACKER_PROFILES, defenses: DEFENSES, objectives: OBJECTIVES });
});

// ── POST /api/simulate ────────────────────────────────────────────────────────
app.post('/api/simulate', (req, res) => {
  const {
    email,
    username,
    passwordEntropy,
    behaviorAnswers,
    attackerProfile = 'osint_attacker',
    activeDefenses = [],
    objective = null,
  } = req.body;

  if (!email && !username) {
    return res.status(400).json({ error: 'Email or username is required.' });
  }

  // 1. Intelligence Gathering
  const breachData   = simulateBreachExposure(email);
  const osintData    = simulateOSINT(username);
  const passHygiene  = checkPasswordHygiene(passwordEntropy);
  const behaviorRisk = assessBehavioralRisk(behaviorAnswers);

  const intel = { breachData, osintData, passHygiene, behaviorRisk };

  // 2. Adaptive Attack Simulation (now with objective)
  const simulation = simulateAttackGraph(intel, attackerProfile, activeDefenses, objective);

  // 3. Risk Scoring (now strategic-aware)
  const riskScore = calculateRiskScore(intel, simulation);

  res.json({
    riskScore,
    risk_score: riskScore, // alias for standard
    attack_graph: simulation.graph,
    decision_trace: simulation.decision_trace,
    skipped_attacks: simulation.skipped_attacks,
    objective: simulation.objective,
    original_objective: simulation.original_objective,
    strategic_analysis: simulation.strategic_analysis,
    scenarios: simulation.graph.nodes
      .filter(n => n.type !== 'target')
      .map(n => ({
        title: n.label,
        description: n.description,
        impact: n.type === 'objective' ? 'Critical' : n.phase === 'Exploitation' ? 'High' : 'Medium',
        killchain: n.phase,
        mitigation: n.blockedBy ? `Mitigated by ${n.blockedBy}` : 'Enhance monitoring for this vector',
        detection_probability: n.detection_probability,
        detection_event: n.detection_event,
        strategic_score: n.strategic_score,
        noise_level: n.noise_level,
        execution_cost: n.execution_cost,
        expected_reward: n.expected_reward,
      })),
    intel,
    simulation,
  });
});

// ── POST /api/whatif ──────────────────────────────────────────────────────────
// Re-runs simulation with different defense scenarios without re-gathering intel
app.post('/api/whatif', (req, res) => {
  const { intel, attackerProfile = 'osint_attacker', activeDefenses = [], objective = null } = req.body;

  if (!intel) {
    return res.status(400).json({ error: 'Intel object is required for what-if analysis.' });
  }

  const simulation = simulateAttackGraph(intel, attackerProfile, activeDefenses, objective);
  const riskScore  = calculateRiskScore(intel, simulation);

  res.json({
    riskScore,
    risk_score: riskScore,
    attack_graph: simulation.graph,
    decision_trace: simulation.decision_trace,
    skipped_attacks: simulation.skipped_attacks,
    objective: simulation.objective,
    original_objective: simulation.original_objective,
    strategic_analysis: simulation.strategic_analysis,
    scenarios: simulation.graph.nodes
      .filter(n => n.type !== 'target')
      .map(n => ({
        title: n.label,
        description: n.description,
        impact: n.type === 'objective' ? 'Critical' : n.phase === 'Exploitation' ? 'High' : 'Medium',
        killchain: n.phase,
        mitigation: n.blockedBy ? `Mitigated by ${n.blockedBy}` : 'Enhance monitoring for this vector',
        detection_probability: n.detection_probability,
        detection_event: n.detection_event,
        strategic_score: n.strategic_score,
        noise_level: n.noise_level,
        execution_cost: n.execution_cost,
        expected_reward: n.expected_reward,
      })),
    simulation 
  });
});

app.listen(PORT, () => {
  console.log(`[+] ADIS v3.0 Strategic Engine running on port ${PORT}`);
});
