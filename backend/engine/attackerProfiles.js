/**
 * Attacker Profiles System — ADIS v3.0
 * 
 * Defines behavioral archetypes that influence attack selection,
 * probability weights, decision paths, stealth/aggression balance,
 * and default objective alignment.
 */

const ATTACKER_PROFILES = {
  script_kiddie: {
    id: 'script_kiddie',
    label: 'Script Kiddie',
    description: 'Opportunistic, low-skill attacker using automated tools. Prefers high-noise shotgun approaches and gives up quickly on failure.',
    sophistication: 'Low',
    patience: 'Low',
    noise: 'High',
    stealth_weight: 0.15,
    aggression_weight: 0.85,
    default_objective: 'account_takeover',
    supported_objectives: ['account_takeover', 'reconnaissance_only'],
    preferences: {
      bruteForce: 0.9,
      credentialStuffing: 0.85,
      phishing: 0.2,
      osint: 0.3,
      socialEngineering: 0.1,
      persistence: 0.15,
      mfaBypass: 0.05,
    },
    maxFallbackDepth: 1,
    timeMultiplier: 0.5,
    color: '#f59e0b',
    icon: 'Zap',
  },

  osint_attacker: {
    id: 'osint_attacker',
    label: 'OSINT Specialist',
    description: 'Methodical attacker who researches targets extensively before striking. Prefers targeted spear-phishing built from digital footprint analysis.',
    sophistication: 'Medium',
    patience: 'High',
    noise: 'Medium',
    stealth_weight: 0.65,
    aggression_weight: 0.35,
    default_objective: 'data_exfiltration',
    supported_objectives: ['account_takeover', 'data_exfiltration', 'social_engineering_spread', 'reconnaissance_only'],
    preferences: {
      bruteForce: 0.2,
      credentialStuffing: 0.4,
      phishing: 0.95,
      osint: 0.99,
      socialEngineering: 0.7,
      persistence: 0.6,
      mfaBypass: 0.3,
    },
    maxFallbackDepth: 2,
    timeMultiplier: 1.5,
    color: '#3b82f6',
    icon: 'Search',
  },

  advanced_persistent: {
    id: 'advanced_persistent',
    label: 'Advanced Persistent Threat',
    description: 'Nation-state or organized criminal group. Patient, multi-stage, low-noise. Chains multiple attack vectors simultaneously and never gives up.',
    sophistication: 'Critical',
    patience: 'Maximum',
    noise: 'Low',
    stealth_weight: 0.8,
    aggression_weight: 0.45,
    default_objective: 'account_takeover',
    supported_objectives: ['account_takeover', 'data_exfiltration', 'social_engineering_spread', 'reconnaissance_only'],
    preferences: {
      bruteForce: 0.3,
      credentialStuffing: 0.7,
      phishing: 0.85,
      osint: 0.95,
      socialEngineering: 0.8,
      persistence: 0.99,
      mfaBypass: 0.65,
    },
    maxFallbackDepth: 4,
    timeMultiplier: 2.5,
    color: '#ef4444',
    icon: 'Skull',
  },
};

const getProfile = (profileId) =>
  ATTACKER_PROFILES[profileId] || ATTACKER_PROFILES.osint_attacker;

module.exports = { ATTACKER_PROFILES, getProfile };
