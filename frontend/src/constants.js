import { Zap, Search, Skull, Crosshair, Database, Users, Eye } from "lucide-react";

export const PROFILE_ICONS = { 
  script_kiddie: Zap, 
  osint_attacker: Search, 
  advanced_persistent: Skull 
};

export const PROFILE_COLORS = { 
  script_kiddie: "#f59e0b", 
  osint_attacker: "#3b82f6", 
  advanced_persistent: "#ef4444" 
};

export const OBJECTIVE_ICONS = {
  account_takeover: Crosshair,
  data_exfiltration: Database,
  social_engineering_spread: Users,
  reconnaissance_only: Eye,
};

export const OBJECTIVE_COLORS = {
  account_takeover: "#ef4444",
  data_exfiltration: "#f59e0b",
  social_engineering_spread: "#8b5cf6",
  reconnaissance_only: "#3b82f6",
};

export const INITIAL_FORM = { 
  email: "", 
  username: "", 
  passwordEntropy: 50, 
  reusedPasswords: true, 
  clickedPhishing: false, 
  uses2FA: false 
};

export const DEFAULT_PROFILES = [
  {id: "script_kiddie", label: "Script Kiddie", sophistication: "Low", description: "Automated tools, high noise"},
  {id: "osint_attacker", label: "OSINT Specialist", sophistication: "Medium", description: "Research-first, targeted phishing"},
  {id: "advanced_persistent", label: "APT", sophistication: "Critical", description: "Multi-vector, patient, low noise"},
];

export const DEFAULT_DEFENSES = [
  {id: "mfa_enabled", label: "2FA / MFA Active"},
  {id: "strong_password", label: "Strong Password Policy"},
  {id: "low_footprint", label: "Minimal Digital Footprint"},
  {id: "awareness_training", label: "Security Awareness Training"},
  {id: "rate_limiting", label: "Rate Limiting"},
];

export const DEFAULT_OBJECTIVES = [
  {id: "account_takeover", label: "Account Takeover", description: "Gain full control of the target identity."},
  {id: "data_exfiltration", label: "Data Exfiltration", description: "Extract sensitive data from the target."},
  {id: "social_engineering_spread", label: "Social Eng. Spread", description: "Use target as a pivot for further attacks."},
  {id: "reconnaissance_only", label: "Recon Only", description: "Gather intel without triggering alerts."},
];
