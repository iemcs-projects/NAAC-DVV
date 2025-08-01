import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria4_3_2 = () => {
  const navigate = useNavigate();

  const [yearScores, setYearScores] = useState({
    2020: 0,
    2021: 0,
    2022: 0,
    2023: 0,
    2024: 0,
  });

  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);

  const goToNextPage = () => {
    navigate("/criteria1.2.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.3");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 4: Infrastructure and Learning Resources
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">4.3 IT Infrastructure</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          {/* Metric Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">4.3.2 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Student – Computer ratio (Data for the latest completed academic year)
            </p>

            <h3 className="text-blue-600 font-medium mb-4 mt-4">Calculation Formula</h3>
            <p className="text-sm text-gray-700">
              Number of students : Number of Computers
            </p>

            <h3 className="text-blue-600 font-medium mb-2 mt-6">Data Requirements:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Number of computers in working condition</li>
              <li>Total number of students</li>
            </ul>
          </div>

          {/* Dynamic Calculation Table */}
          <div className="overflow-auto border rounded p-4 mb-6 bg-white">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Calculation Table (Last 5 Years)
            </h2>
            <table className="table-auto border-collapse w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold">
                  <th className="border px-4 py-2">Year</th>
                  {Object.keys(yearScores).map((year) => (
                    <th key={year} className="border px-4 py-2">
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium text-gray-600">
                    Calculated Score
                  </td>
                  {Object.keys(yearScores).map((year) => (
                    <td key={year} className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        value={yearScores[year]}
                        onChange={(e) =>
                          setYearScores({
                            ...yearScores,
                            [year]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 text-center border px-1 rounded text-gray-950"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-medium text-gray-700">
                Enter number of years for average:
              </label>
              <input
                type="number"
                value={yearCount}
                min={1}
                max={5}
                onChange={(e) =>
                  setYearCount(parseInt(e.target.value) || 1)
                }
                className="w-20 border px-2 py-1 rounded text-center text-gray-950"
              />
              <button
                className="ml-4 px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-green-700"
                onClick={() => {
                  const values = Object.values(yearScores).slice(0, yearCount);
                  const sum = values.reduce((acc, val) => acc + val, 0);
                  setAverageScore((sum / yearCount).toFixed(2));
                }}
              >
                Calculate Average
              </button>
            </div>
            {averageScore !== null && (
              <div className="mt-4 text-blue-700 font-semibold">
                Average Score for last {yearCount} year(s): {averageScore}%
              </div>
            )}
          </div>

          {/* Uploads and Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Any additional information</li>
                <li>Details of library usage by teachers and students</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-6">
              Upload Documents
            </label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
                <i className="fas fa-upload mr-2"></i> Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Paste Link for Additional Information
            </label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Navigation Footer */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_3_2;

