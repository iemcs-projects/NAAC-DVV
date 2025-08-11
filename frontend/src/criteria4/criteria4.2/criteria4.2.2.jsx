import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import { useEffect } from "react";

const Criteria4_2_2 = () => {
  const { sessions: availableSessions } = useContext(SessionContext);
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [currentYear, setCurrentYear] = useState(pastFiveYears[0]);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  
  
  // Changed to handle multiple selections
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });
  
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);

  // Updated to handle checkbox changes
  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
 
  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };

  const libraryResources = [
    "Books",
    "Journals",
    "e-journals",
    "e-books",
    "e-ShodhSindhu",
    "Shodhganga",
    "Databases",
  ];

  const [year1Data, setYear1Data] = useState(
    libraryResources.map((resource) => ({
      resource,
      membershipDetails: "",
      expenditure: "",
      totalExpenditure: "",
      link: "",
    }))
  );

  const handleYear1Change = (index, field, value) => {
    const updated = [...year1Data];
    updated[index][field] = value;
    setYear1Data(updated);
  };

  const [formData, setFormData] = useState({
      roomno: "",
      type: "",
      link: "",
    });
    const [submittedData, setSubmittedData] = useState([]);
  
    const handleChange = (field, value) => {
      setFormData({ ...formData, [field]: value });
    };
  
    const handleSubmit = () => {
      if (
        formData.roomno &&
        formData.type &&
        formData.link 
        
      ) {
        setSubmittedData([...submittedData, formData]);
        setFormData({
          roomno: "",
      type: "",
      link: "",
        });
      } else {
        alert("Please fill in all required fields.");
      }
    };

  const navigate = useNavigate()
  const goToNextPage = () => {
    navigate("/criteria4.2.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria4.2.1");
  };

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount >= 4) return 'A. Any 4 or more of the above';
    if (selectedCount === 3) return 'B. Any 3 of the above';
    if (selectedCount === 2) return 'C. Any 2 of the above';
    if (selectedCount === 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  return (
       <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
           
          <div className="flex justify-between items-center mb-3 ">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 4: Infrastructure and Learning Resources
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">4.2  IT Infrastructure</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.2.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
               The institution has subscription for the following e-resources
1. e-journals<br/>
2. e-ShodhSindhu<br/>
3. Shodhganga Membership<br/>
4. e-books<br/>
5. Databases<br/>
6. Remote access to e-resources<br/>
  <br/>
  Choose from the following<br/>    
A. Any 4 or more of the above<br/>
B. Any 3 of the above<br/>
C. Any 2 of the above<br/>
D. Any 1 of the above<br/>
E. None of the above <br/>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Upload any additional information</li>
                <li>Details of subscriptions like e-journals, e-ShodhSindhu,</li>
                <li>Shodhganga Membership etc (Data Template)</li>
               </ul>
            </div>
          </div>

          {/* Multiple Selection Checkboxes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the E-resources Available (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "option1", label: "1. e-journals" },
                { key: "option2", label: "2. e-ShodhSindhu" },
                { key: "option3", label: "3. Shodhganga Membership" },
                { key: "option4", label: "4. e-books" },
                { key: "option5", label: "5. Databases" }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedOptions[key]}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  <label htmlFor={key} className="text-sm text-gray-800">{label}</label>
                </div>
              ))}
            </div>
            
            {/* Grade Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Option Selected: {getGrade()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Selected: {Object.values(selectedOptions).filter(Boolean).length} out of 5 resources
              </p>
            </div>
          </div>

          <div className="p-6 bg-white shadow rounded-md max-w-full overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Library Resources
            </h2>

            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="border text-gray-950 px-3 py-2">Library Resources</th>
                  <th className="border text-gray-950 px-3 py-2">Membership/Subscription Details</th>
                  <th className="border text-gray-950 px-3 py-2">Expenditure (in Lakhs)</th>
                  <th className="border text-gray-950 px-3 py-2">Total Expenditure</th>
                  <th className="border text-gray-950 px-3 py-2">Link to Document</th>
                </tr>
              </thead>
              <tbody>
                {year1Data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border text-gray-950 px-3 py-2">{row.resource}</td>
                    <td className="border text-gray-950 px-3 py-2">
                      <input
                        type="text"
                        className="w-full border rounded text-gray-950 px-2 py-1"
                        value={row.membershipDetails}
                        onChange={(e) =>
                          handleYear1Change(index, "membershipDetails", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        className="w-full border text-gray-950 rounded px-2 py-1"
                        value={row.expenditure}
                        onChange={(e) =>
                          handleYear1Change(index, "expenditure", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        className="w-full border text-gray-950 rounded px-2 py-1"
                        value={row.totalExpenditure}
                        onChange={(e) =>
                          handleYear1Change(index, "totalExpenditure", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="text"
                        className="w-full border text-gray-950 rounded px-2 py-1"
                        value={row.link}
                        onChange={(e) =>
                          handleYear1Change(index, "link", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Upload any additional information</li>
                <li>Details of subscriptions like e-journals, e-ShodhSindhu, Shodhganga Membership etc (Data Template)</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
                <i className="fas fa-upload mr-2"></i> Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>
          </div>

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_2_2;