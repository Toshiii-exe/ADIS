import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:5000/api";

export function useSimulation() {
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatifLoading, setWhatifLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial meta data fetch
  useEffect(() => {
    axios.get(`${API_BASE}/meta`)
      .then(r => setMeta(r.data))
      .catch(err => console.error("Failed to fetch meta:", err));
  }, []);

  const runSimulation = async (formData, profile, defenses, objective = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/simulate`, {
        email: formData.email,
        username: formData.username,
        passwordEntropy: parseInt(formData.passwordEntropy),
        behaviorAnswers: {
          reusedPasswords: formData.reusedPasswords,
          clickedPhishing: formData.clickedPhishing,
          uses2FA: formData.uses2FA
        },
        attackerProfile: profile,
        activeDefenses: defenses,
        objective: objective,
      });
      setResults(response.data);
      return response.data;
    } catch (err) {
      setError("Simulation failed. Ensure backend is running on port 5000.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recomputeWhatIf = async (intel, profile, defenses, objective = null) => {
    if (!intel) return;
    setWhatifLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/whatif`, {
        intel,
        attackerProfile: profile,
        activeDefenses: defenses,
        objective: objective,
      });
      setResults(prev => ({
        ...prev,
        ...response.data
      }));
      return response.data;
    } catch (err) {
      console.error("What-if recompute failed:", err);
    } finally {
      setWhatifLoading(false);
    }
  };

  return {
    results,
    meta,
    loading,
    whatifLoading,
    error,
    runSimulation,
    recomputeWhatIf
  };
}
