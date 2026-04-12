import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const CycleContext = createContext();

export const CycleProvider = ({ children }) => {
  const [history, setHistory]       = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [riskData, setRiskData]     = useState({
    riskScore: 0,
    level: 'normal',
    averageGap: 0,
  });
  const [prediction, setPrediction] = useState({
    predictedDate: null,
    ovulationDate: null,
    averageCycleLength: 28,
  });
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    try {
      setLoading(true);
      const [historyRes, riskRes, predictRes, profileRes] = await Promise.all([
        api.get('/cycle/history'),
        api.get('/cycle/pcod-risk'),
        api.get('/cycle/predict'),
        api.get('/auth/profile'),
      ]);
      setHistory(historyRes.data || []);
      setRiskData(riskRes.data   || { riskScore: 0, level: 'normal', averageGap: 0 });
      setPrediction(predictRes.data || { predictedDate: null, ovulationDate: null });

      // Keep localStorage in sync and expose profile via context
      if (profileRes.data) {
        const cached = JSON.parse(localStorage.getItem('user') || '{}');
        const merged = { ...cached, ...profileRes.data };
        localStorage.setItem('user', JSON.stringify(merged));
        setUserProfile(profileRes.data);
      }
    } catch (err) {
      console.error('CycleContext: Error fetching data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <CycleContext.Provider value={{ history, userProfile, riskData, prediction, loading, refreshData }}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = () => {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used within CycleProvider');
  return ctx;
};

export default CycleContext;
