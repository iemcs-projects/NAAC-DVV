import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useGpa } from './contextprovider/GpaContext';

const RadarGraphSection = () => {
    const { criteria, isLoading, error } = useGpa(); // Add isLoading and error from useGpa
    const [radarData, setRadarData] = useState([]);
  
    useEffect(() => {
      if (criteria && criteria.length > 0) {
        const formattedData = criteria.map(crit => ({
          criteria: `C${crit.id}`,
          current: crit.score,
          target: crit.target
        }));
        setRadarData(formattedData);
      }
    }, [criteria]);
  
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Criteria Overview</h3>
          <p className="text-gray-600">Visual representation of NAAC criteria performance</p>
        </div>
  
        {isLoading ? (  // Changed from loading to isLoading
          <p className="text-center text-gray-500">Loading radar chart...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="flex justify-center">
            <div style={{ width: "600px", height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="criteria" tick={{ fontSize: 14 }} />
                  <PolarRadiusAxis domain={[0, 1]} /> {/* Updated domain to [0, 1] since scores are between 0 and 1 */}
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

export default RadarGraphSection;