import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [desiredGrade, setDesiredGrade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionsAndGrade = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/v1/iiqa/sessions");
        const data = response.data?.data || [];

        if (data.length > 0) {
          const latestSession = data[0];
          const { session_start_year, session_end_year, desired_grade } = latestSession;

          setDesiredGrade(desired_grade || null);

          const sessionList = [];
          for (let year = session_start_year; year < session_end_year; year++) {
            sessionList.push(`${year}-${(year + 1).toString().slice(-2)}`);
          }
          setSessions(sessionList);
        } else {
          setError("No sessions found");
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Could not load session years");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionsAndGrade();
  }, []);

  return (
    <SessionContext.Provider value={{ sessions, desiredGrade, isLoading, error }}>
      {children}
    </SessionContext.Provider>
  );
};
