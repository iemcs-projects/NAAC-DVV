import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ onCollapse }) => {
  const [expandedCriteria, setExpandedCriteria] = useState(null);
  const [expandedSubCriteria, setExpandedSubCriteria] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onCollapse) onCollapse(newState);
  };
  const navigate = useNavigate();

  const toggleCriteria = (criteriaId) => {
    setExpandedCriteria((prev) => (prev === criteriaId ? null : criteriaId));
    setExpandedSubCriteria(null);
  };

  const toggleSubCriteria = (subId) => {
    setExpandedSubCriteria((prev) => (prev === subId ? null : subId));
  };

  const fullCriteriaList = [
    {
      id: "1",
      title: "Criteria 1: Curricular Aspects",
      subCriteria: [
        {
          id: "1.1",
          name: "1.1 Curriculum Design and Review",
          subItems: ["1.1.1", "1.1.2", "1.1.3"],
        },
        {
          id: "1.2",
          name: "1.2 Academic Flexibility",
          subItems: ["1.2.1", "1.2.2", "1.2.3"],
        },
        {
          id: "1.3",
          name: "1.3 Curriculum Enrichment",
          subItems: ["1.3.1", "1.3.2", "1.3.3"],
        },
        {
          id: "1.4",
          name: "1.4 Feedback System",
          subItems: ["1.4.1", "1.4.2"],
        },
      ],
    },
    {
      id: "2",
      title: "Criteria 2: Teaching-Learning and Evaluation",
      subCriteria: [
        {
          id: "2.1",
          name: "2.1 Student Enrollment",
          subItems: ["2.1.1", "2.1.2"],
        },
        {
          id: "2.2",
          name: "2.2 Catering to Student Diversity",
          subItems: ["2.2.1", "2.2.2", ],
        },
        {
          id: "2.3",
          name: "2.3 Teaching- Learning Process",
          subItems: ["2.3.1", "2.3.2", "2.3.3"],
        },
        {
          id: "2.4",
          name: "2.4 Teacher Profile and Quality",
          subItems: ["2.4.1", "2.4.2", "2.4.3"],
        },
        {
          id: "2.5",
          name: "2.5 Teacher Profile and Quality",
          subItems: ["2.5.1", "2.5.2", "2.5.3"],
        },
        {
          id: "2.6",
          name: "2.6 Student Performance and Learning Outcome",
          subItems: ["2.6.1", "2.6.2", "2.6.3"],
        },
        {
          id: "2.7",
          name: "2.7 Student Performance and Learning Outcome",
          subItems: ["2.7.1"],
        },
      ],
    },
    {
      id: "3",
      title: "Criteria 3: Research, Innovations and Extension",
      subCriteria: [
        {
          id: "3.1",
          name: "3.1 Promotion of Research",
          subItems: ["3.1.1", "3.1.2","3.1.3"],
        },
        {
          id: "3.2",
          name: "3.2 Promotion of Research",
          subItems: ["3.2.1", "3.2.2"],
        },
        {
          id: "3.3",
          name: "3.3 Extension Activities",
          subItems: ["3.3.1", "3.3.2", "3.3.3","3.3.4"],
        },
        {
          id: "3.4",
          name: "3.4 Collaboration",
          subItems: ["3.4.1", "3.4.2"]
        },
        
      ],
    },
    {
      id: "4",
      title: "Criteria 4: Infrastructure and Learning Resources",
      subCriteria: [
        {
          id: "4.1",
          name: "4.1 Physical Infrastructure",
          subItems: ["4.1.1", "4.1.2", "4.1.3", "4.1.4"],
        },
        {
          id: "4.2",
          name: "4.2 Library Infrastructure",
          subItems: ["4.2.1", "4.2.2", "4.2.3", "4.2.4"],
        },
        {
          id: "4.3",
          name: "4.3 IT Infrastructure",
          subItems: ["4.3.1", "4.3.2", "4.3.3"],
        },
        {
          id: "4.4",
          name: "4.4 Infrastructure",
          subItems: ["4.4.1", "4.4.2"],
        },
      ],
    },
    {
      id: "5",
      title: "Criteria 5: Student Support and Progression",
      subCriteria: [
        {
          id: "5.1",
          name: "5.1 Student Support",
          subItems: ["5.1.1", "5.1.2", "5.1.3", "5.1.4", "5.1.5"],
        },
        {
          id: "5.2",
          name: "5.2 Student Progression",
          subItems: ["5.2.1", "5.2.2", "5.2.3"],
        },
        {
          id: "5.3",
          name: "5.3 Student Participation and Activities",
          subItems: ["5.3.1", "5.3.2", "5.3.3"],
        },
        {
          id: "5.4",
          name: "5.4 Alumni Engagement",
          subItems: ["5.4.1", "5.4.2"],
        },
      ],
    },
    {
      id: "6",
      title: "Criteria 6: Governance, Leadership and Management",
      subCriteria: [
        {
          id: "6.1",
          name: "6.1 Institutional Vision and Leadership",
          subItems: ["6.1.1", "6.1.2"],
        },
        {
          id: "6.2",
          name: "6.2 Strategy Development and Deployment",
          subItems: ["6.2.1", "6.2.2","6.2.3"],
        },
        {
          id: "6.3",
          name: "6.3 Faculty Empowerment Strategies",
          subItems: ["6.3.1", "6.3.2","6.3.3","6.3.4","6.3.5"],
        },
        {
          id: "6.4",
          name: "6.4 Faculty Empowerment Strategies",
          subItems: ["6.4.1", "6.4.2","6.4.3"],
        },
        {
          id: "6.5",
          name: "6.5 Faculty Empowerment Strategies",
          subItems: ["6.5.1", "6.5.2","6.5.3"],
        },
      ],
    },

    {
      id: "7",
      title: "Criteria 7: Institutional Values and Best Practices",
      subCriteria: [
        {
          id: "7.1",
          name: "7.1 Environment Consciousness",
          subItems: ["7.1.1", "7.1.2", "7.1.3", "7.1.4", "7.1.5", "7.1.6", "7.1.7", "7.1.8", "7.1.9", "7.1.10", "7.1.11"],
        },
        {
          id: "7.2",
          name: "7.1 Environment Consciousness",
          subItems: ["7.2.1"],
        },
      ],
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-12" : "w-64"
      } !bg-gray-800 min-h-screen transition-all duration-300 fixed top-0 left-0 overflow-y-auto`}
      style={{ maxHeight: '100vh' }}
    >
      <div className="flex justify-between !bg-gray-800 items-center p-2">
        <span className="text-sm font-medium !bg-gray-800 text-gray-300">
          {!collapsed && "Criteria"}
        </span>
        <button
          onClick={toggleSidebar}
          className="!bg-gray-700 !border-white hover:text-white"
        >
          <FontAwesomeIcon icon={collapsed ? faAngleRight : faAngleLeft} />
        </button>
      </div>

      {!collapsed && (
        <div className="text-gray-300 !bg-gray-800 pb-20">
          {fullCriteriaList.map((criteria) => (
            <div className="relative text-gray-300 !bg-gray-800" key={criteria.id}>
              <button
  className="w-full text-left p-4 pr-10 text-sm font-medium !text-gray-300 !bg-gray-800 cursor-pointer"
  onClick={() => toggleCriteria(criteria.id)}
>
  {criteria.title}
</button>
              {expandedCriteria === criteria.id && (
                <div className="pl-6 bg-gray-800 ml-4 mt-2">
                  {criteria.subCriteria.map((sub) => (
                    <div key={sub.id}>
                      <div
                        className="py-2 px-4 text-sm !text-gray-300 !bg-gray-800 font-medium cursor-pointer"
                        onClick={() => toggleSubCriteria(sub.id)}
                      >
                        {sub.name}
                      </div>

                      {expandedSubCriteria === sub.id && (
                        <div className="pl-6 !bg-gray-800 ml-4">
                          {sub.subItems.map((item) => (
                            <div
                              key={item}
                              onClick={() => navigate(`/criteria${item}`)}
                              className="py-2 px-4 text-sm !text-gray-300 !bg-gray-800 hover:bg-gray-50 cursor-pointer"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;