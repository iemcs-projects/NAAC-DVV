import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

export const GpaContext = createContext();

export const GpaProvider = ({ children }) => {
  const [gpaData, setGpaData] = useState({
    collegeId: '',
    currentGPA: 0,
    targetGPA: 0,
    grade: 'N/A',
    criteria: [],
    isLoading: true,
    error: null,
  });

// In GpaContext.jsx
const fetchGpaData = useCallback(async () => {
  try {
    setGpaData(prev => ({ ...prev, isLoading: true, error: null }));
    const response = await axios.get('http://localhost:3000/api/v1/scores/radarGrade');
    
    const { criteria: criteriaData, scores } = response.data;
    const currentScores = scores.find(s => s.name === 'Current Score')?.values || [];
    const targetScores = scores.find(s => s.name === 'Target Score')?.values || [];

    const processedCriteria = criteriaData.map((criteria, index) => ({
      id: criteria.id,
      title: criteria.name,
      score: currentScores[index] || 0,
      target: targetScores[index] || 0,
      status: currentScores[index] >= targetScores[index] ? 'Met' : 'Not Met',
      max: criteria.max
    }));

    // Calculate current and target GPA (average of all criteria scores)
    const currentGPA = currentScores.reduce((sum, score) => sum + (score || 0), 0) / Math.max(1, currentScores.length);
    const targetGPA = targetScores.reduce((sum, score) => sum + (score || 0), 0) / Math.max(1, targetScores.length);

    setGpaData(prev => ({
      ...prev,
      currentGPA,
      targetGPA,
      criteria: processedCriteria,
      isLoading: false,
      error: null
    }));
  } catch (error) {
    console.error('Error fetching GPA data:', error);
    setGpaData(prev => ({
      ...prev,
      isLoading: false,
      error: error.message || 'Failed to load GPA data',
      criteria: createEmptyCriteria()
    }));
  }
}, []);

  useEffect(() => {
    fetchGpaData();
  }, [fetchGpaData]);

  return (
    <GpaContext.Provider value={{ ...gpaData, refetch: fetchGpaData }}>
      {children}
    </GpaContext.Provider>
  );
};

export const useGpa = () => {
  const context = useContext(GpaContext);
  if (!context) {
    throw new Error('useGpa must be used within a GpaProvider');
  }
  return context;
};
