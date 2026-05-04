# ADIS: Adversarial Digital Identity Simulator v3.0

![ADIS Banner](https://img.shields.io/badge/Security-Simulation-red?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-3.0.0--Strategic-purple?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Electron-blue?style=for-the-badge)

**ADIS (Adversarial Digital Identity Simulator)** is a professional-grade strategic simulation platform designed to model complex adversarial behavior against digital identities. Unlike static risk assessments, ADIS uses a dynamic, probability-based engine to compute realistic attack paths based on cost-benefit analysis, stealth tradeoffs, and specific attacker objectives.

---

## 🚀 Key Features (v3.0 Strategic Edition)

### 1. Strategic Decision Engine
The core engine computes an **Adversarial Decision Score** for every potential move, balancing expected rewards against execution costs and detection risks.
- **Cost-Reward Modeling**: Simulates how real attackers prioritize low-effort, high-gain vectors.
- **Stealth vs. Aggression**: Dynamic behavioral modulation based on attacker profiles and defensive pressure.

### 2. Multi-Objective Simulation
Simulate attacks with specific end-goals in mind:
- **Account Takeover (ATO)**: Full identity compromise.
- **Data Exfiltration**: Silent extraction of sensitive records.
- **Social Engineering Spread**: Using the target as a pivot for lateral movement.
- **Reconnaissance Only**: Silent footprinting without triggering alerts.

### 3. Detection & Evasion Layer
Probabilistic simulation of security controls and monitoring:
- **Detection Events**: Simulates real-time alerts that force an attacker to **Abort**, **Pivot**, or **Persist**.
- **Noise Analysis**: Every attack vector is rated by its "noise" level, influencing the likelihood of detection.

### 4. Interactive Strategic Dashboard
A premium React-based interface for visualizing the adversarial lifecycle:
- **Adversarial Chain Analysis**: Live graph visualization of attack progression.
- **Strategic Mode**: Toggle inner-thinking mode to see the math behind the attacker's decisions.
- **What-If Defense Simulation**: Instantly see how enabling MFA or Rate Limiting shifts the risk landscape.

---

## 🛠️ Architecture

- **Frontend**: React + Vite + Framer Motion + Lucide React
- **Backend**: Node.js + Express (Strategic Intelligence Engine)
- **Desktop Wrapper**: Electron
- **Visualization**: @xyflow/react (React Flow)

---

## 📥 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Git

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Toshiii-exe/ADIS.git
   cd ADIS
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   npm run install-all
   ```

3. **Run in Development Mode**:
   ```bash
   npm run dev
   ```

---

## 🛡️ Strategic Models & Risk Scoring
ADIS v3.0 introduces a composite risk scoring system that factors in:
- **Breach Exposure**: Real-world leaked credential data.
- **Behavioral Susceptibility**: Human-factor risk modeling.
- **Evasion Rate**: The attacker's ability to navigate the environment undetected.
- **Strategic Path Efficiency**: The logical soundness of the chosen attack route.

---

## 📝 License
This project is for research and educational purposes only. Always use simulation tools responsibly.

---

**Developed for Advanced Adversarial Research.**
