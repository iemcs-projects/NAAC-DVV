import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';

export const GpaDataContext = createContext();

export const GpaDataProvider = ({ children }) => {
  const [gpaData, setGpaData] = useState({
    collegeId: '',
    currentGPA: 0,
    targetGPA: 0,
    grade: 'N/A',
    criteria: [],
    isLoading: true,
    error: null,
  });

  const fetchGpaData = useCallback(async () => {
    try {
      setGpaData(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await axios.post('http://localhost:3000/api/v1/scores/getCollegeSummary');
      console.log('API Response:', response.data);

      const apiData = response.data;

      // If data is missing, fall back to default
      const criteria = (apiData.criteria || []).map((crit, index) => ({
        id: crit.id ?? index + 1,
        title: crit.title?.trim() ?? `Criteria ${index + 1}`,
        score: crit.score ?? 0,
        target: crit.target ?? 0,
        status: crit.status ?? 'Not Set',
        averageGrade: crit.averageGrade ?? 0,
        subcriteria: (crit.subcriteria || []).map((sub, subIndex) => ({
          code: sub.code ?? `${crit.id ?? index + 1}.0${subIndex + 1}`,
          title: sub.title ?? `Subcriteria ${subIndex + 1}`,
          score: sub.score ?? 0,
          target: sub.target ?? 0,
          grade: sub.grade ?? 0,
          targetPercentage: sub.targetPercentage ?? 0
        }))
      }));

      setGpaData({
        collegeId: apiData.collegeId ?? '',
        currentGPA: apiData.currentGPA ?? 0,
        targetGPA: apiData.targetGPA ?? 0,
        grade: apiData.grade ?? 'N/A',
        criteria,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching GPA data:', error);
      setGpaData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch GPA data'
      }));
    }
  }, []);

  useEffect(() => {
    fetchGpaData();
  }, [fetchGpaData]);
  const criteriaLacking = useMemo(() => {
    if (!Array.isArray(gpaData.criteria)) {
      console.warn('criteria is not an array:', gpaData.criteria);
      return 0;
    }
    
    console.log('All criteria with scores and targets:', 
      gpaData.criteria.map(c => ({
        id: c.id,
        title: c.title,
        score: c.score,
        target: c.target,
        isLacking: c.score < c.target
      }))
    );
    
    const validCriteria = gpaData.criteria.filter(c => 
      c && typeof c === 'object' && 
      'score' in c && 'target' in c &&
      typeof c.score === 'number' && 
      typeof c.target === 'number'
    );
    
    const lackingCriteria = validCriteria.filter(c => c.score < c.target);
    const lacking = lackingCriteria.length;
    
    console.log('criteriaLacking calculation:', {
      totalCriteria: gpaData.criteria.length,
      validCriteria: validCriteria.length,
      criteriaLacking: lacking,
      lackingCriteria: lackingCriteria.map(c => ({
        id: c.id,
        title: c.title,
        score: c.score,
        target: c.target
      })),
      allCriteria: validCriteria.map(c => ({
        id: c.id,
        title: c.title,
        score: c.score,
        target: c.target,
        isLacking: c.score < c.target
      }))
    });
    
    return lacking;
  }, [gpaData.criteria]);

  const contextValue = useMemo(() => ({
    ...gpaData,
    criteriaLacking,
    refetch: fetchGpaData
  }), [gpaData, criteriaLacking, fetchGpaData]);


  return (
    <GpaDataContext.Provider value={contextValue}>
      {children}
    </GpaDataContext.Provider>
  );
};

export const useGpaData = () => {
  const context = useContext(GpaDataContext);
  if (!context) {
    throw new Error('useGpaData must be used within a GpaDataProvider');
  }
  return context;
};
