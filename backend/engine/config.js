/**
 * Simulation Configuration — ADIS v3.0
 * 
 * Defines static data for nodes and defenses used by the engine.
 * Each node now includes strategic properties:
 *   - execution_cost (0-1): time + effort + resource expenditure
 *   - expected_reward (0-1): likelihood contribution toward objective
 *   - detection_probability (0-1): base chance of being caught
 *   - noise_level: 'low' | 'medium' | 'high'
 *   - _defenseInteractions: map of defense IDs to interaction type
 */

const NODE_TEMPLATES = {
  target: {
    id: 'target', label: 'Target Digital Identity',
    phase: 'Initial', type: 'target',
    timeHours: 0, baseSuccessRate: 1.0,
    description: 'The target digital identity under simulation.',
    mitre: null,
    execution_cost: 0, expected_reward: 0, detection_probability: 0, noise_level: 'low',
    _defenseInteractions: {},
  },
  recon_passive: {
    id: 'recon_passive', label: 'Passive Reconnaissance',
    phase: 'Reconnaissance', type: 'attack',
    timeHours: 2, baseSuccessRate: 0.95,
    description: 'Attacker performs passive OSINT collection: social media, professional profiles, public data sources — without triggering alerts.',
    mitre: 'T1589',
    execution_cost: 0.1, expected_reward: 0.3, detection_probability: 0.05, noise_level: 'low',
    _defenseInteractions: { low_footprint: 'reduces' },
  },
  recon_active: {
    id: 'recon_active', label: 'Active Footprint Analysis',
    phase: 'Reconnaissance', type: 'attack',
    timeHours: 4, baseSuccessRate: 0.80,
    description: 'Attacker actively enumerates reused usernames across platforms, email patterns, and exposed services.',
    mitre: 'T1591',
    execution_cost: 0.25, expected_reward: 0.45, detection_probability: 0.2, noise_level: 'medium',
    _defenseInteractions: { low_footprint: 'blocks', rate_limiting: 'monitors' },
  },
  breach_lookup: {
    id: 'breach_lookup', label: 'Breach Database Lookup',
    phase: 'Weaponization', type: 'attack',
    timeHours: 1, baseSuccessRate: 0.70,
    description: 'Attacker queries dark web breach dumps and credential marketplaces for target email / username.',
    mitre: 'T1589.001',
    execution_cost: 0.15, expected_reward: 0.55, detection_probability: 0.05, noise_level: 'low',
    _defenseInteractions: {},
  },
  credential_stuffing: {
    id: 'credential_stuffing', label: 'Credential Stuffing',
    phase: 'Exploitation', type: 'attack',
    timeHours: 6, baseSuccessRate: 0.55,
    description: 'Automated login attempts across multiple services using leaked credential pairs.',
    mitre: 'T1110.004',
    execution_cost: 0.4, expected_reward: 0.7, detection_probability: 0.5, noise_level: 'high',
    _defenseInteractions: { mfa_enabled: 'blocks', strong_password: 'reduces', rate_limiting: 'monitors' },
  },
  brute_force: {
    id: 'brute_force', label: 'Password Spray / Brute Force',
    phase: 'Exploitation', type: 'attack',
    timeHours: 12, baseSuccessRate: 0.28,
    description: 'Systematic password guessing using common patterns and dictionaries.',
    mitre: 'T1110.003',
    execution_cost: 0.7, expected_reward: 0.5, detection_probability: 0.7, noise_level: 'high',
    _defenseInteractions: { mfa_enabled: 'blocks', strong_password: 'blocks', rate_limiting: 'blocks' },
  },
  spear_phishing: {
    id: 'spear_phishing', label: 'Spear Phishing Campaign',
    phase: 'Delivery', type: 'attack',
    timeHours: 8, baseSuccessRate: 0.48,
    description: 'Highly targeted phishing email leveraging personal details gathered from OSINT.',
    mitre: 'T1566.001',
    execution_cost: 0.5, expected_reward: 0.65, detection_probability: 0.25, noise_level: 'medium',
    _defenseInteractions: { awareness_training: 'blocks' },
  },
  social_engineering: {
    id: 'social_engineering', label: 'Social Engineering / Impersonation',
    phase: 'Delivery', type: 'attack',
    timeHours: 16, baseSuccessRate: 0.35,
    description: 'Attacker impersonates IT support, a colleague, or a vendor.',
    mitre: 'T1656',
    execution_cost: 0.6, expected_reward: 0.55, detection_probability: 0.3, noise_level: 'medium',
    _defenseInteractions: { awareness_training: 'blocks' },
  },
  mfa_bypass: {
    id: 'mfa_bypass', label: 'MFA Bypass (SIM-Swap / AITM)',
    phase: 'Exploitation', type: 'attack',
    timeHours: 5, baseSuccessRate: 0.20,
    description: 'Advanced technique: SIM-swapping, OTP interception via adversary-in-the-middle proxy.',
    mitre: 'T1621',
    execution_cost: 0.8, expected_reward: 0.85, detection_probability: 0.35, noise_level: 'medium',
    _defenseInteractions: { mfa_enabled: 'reduces', awareness_training: 'reduces' },
  },
  session_hijack: {
    id: 'session_hijack', label: 'Session Token Theft',
    phase: 'Exploitation', type: 'attack',
    timeHours: 3, baseSuccessRate: 0.38,
    description: 'Steal authenticated session tokens via XSS payload or malicious extensions.',
    mitre: 'T1539',
    execution_cost: 0.45, expected_reward: 0.75, detection_probability: 0.2, noise_level: 'low',
    _defenseInteractions: { mfa_enabled: 'reduces' },
  },
  account_takeover: {
    id: 'account_takeover', label: 'Account Takeover (ATO)',
    phase: 'Actions on Objectives', type: 'objective',
    timeHours: 1, baseSuccessRate: 0.95,
    description: 'Full control of identity established.',
    mitre: 'T1078',
    execution_cost: 0.1, expected_reward: 0.95, detection_probability: 0.15, noise_level: 'low',
    _defenseInteractions: {},
  },
  lateral_movement: {
    id: 'lateral_movement', label: 'Lateral Movement',
    phase: 'Actions on Objectives', type: 'objective',
    timeHours: 24, baseSuccessRate: 0.60,
    description: 'Attacker pivots to connected accounts or cloud resources.',
    mitre: 'T1021',
    execution_cost: 0.65, expected_reward: 0.8, detection_probability: 0.4, noise_level: 'medium',
    _defenseInteractions: {},
  },
  data_exfil: {
    id: 'data_exfil', label: 'Data Exfiltration',
    phase: 'Actions on Objectives', type: 'objective',
    timeHours: 4, baseSuccessRate: 0.75,
    description: 'Attacker exfiltrates PII or sensitive records.',
    mitre: 'T1048',
    execution_cost: 0.35, expected_reward: 0.9, detection_probability: 0.45, noise_level: 'medium',
    _defenseInteractions: {},
  },
  persistence: {
    id: 'persistence', label: 'Establish Persistence',
    phase: 'Actions on Objectives', type: 'objective',
    timeHours: 8, baseSuccessRate: 0.65,
    description: 'Attacker creates recovery backdoor.',
    mitre: 'T1098',
    execution_cost: 0.5, expected_reward: 0.7, detection_probability: 0.3, noise_level: 'low',
    _defenseInteractions: {},
  },
};

const DEFENSES = {
  mfa_enabled: {
    id: 'mfa_enabled', label: '2FA / MFA Active',
    blocks: ['credential_stuffing', 'brute_force'],
    reduces: ['mfa_bypass', 'session_hijack'],
    breakpointLabel: 'BLOCKED by MFA',
    color: '#22c55e',
  },
  strong_password: {
    id: 'strong_password', label: 'Strong Password Policy',
    blocks: ['brute_force'],
    reduces: ['credential_stuffing'],
    breakpointLabel: 'BLOCKED by Policy',
    color: '#22c55e',
  },
  low_footprint: {
    id: 'low_footprint', label: 'Minimal Digital Footprint',
    blocks: ['recon_active'],
    reduces: ['spear_phishing', 'social_engineering'],
    breakpointLabel: 'REDUCED — Limited OSINT',
    color: '#a78bfa',
  },
  awareness_training: {
    id: 'awareness_training', label: 'Security Awareness Training',
    blocks: ['spear_phishing', 'social_engineering'],
    reduces: ['mfa_bypass'],
    breakpointLabel: 'BLOCKED by Awareness',
    color: '#22c55e',
  },
  rate_limiting: {
    id: 'rate_limiting', label: 'Rate Limiting / Account Lockout',
    blocks: ['brute_force'],
    reduces: ['credential_stuffing'],
    breakpointLabel: 'BLOCKED by Lockout',
    color: '#22c55e',
  },
};

module.exports = { NODE_TEMPLATES, DEFENSES };
