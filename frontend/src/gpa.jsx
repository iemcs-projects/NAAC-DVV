import React, { useState , useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { SessionContext } from './contextprovider/sessioncontext';
import Sidebar from './components/iqac-sidebar';
import UserDropdown from './components/UserDropdown';
import { useAuth } from './auth/authProvider';
import { navItems } from './config/navigation';
import {useGpaData} from './contextprovider/gpadata';
import RadarGraphSection from './Radar';


const Header = () => {
  const { user } = useAuth();
  
  const {
    currentGPA,
    targetGPA,
    grade,
    criteria,
    isLoading,
    error,
  } = useGpaData();

  const renderDebugInfo = () => {
    if (isLoading) return <div className="p-4 text-gray-500">Loading data...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">API Response (Debug)</h3>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
          <pre className="text-xs text-gray-800">
            {JSON.stringify({
              currentGPA,
              targetGPA,
              grade,
              criteria: criteria?.map(c => ({
                id: c.id,
                title: c.title,
                score: c.score,
                target: c.target,
                status: c.status,
                subcriteria: c.subcriteria?.map(s => ({
                  code: s.code,
                  title: s.title,
                  score: s.score,
                  target: s.target,
                  grade: s.grade,
                  targetPercentage: s.targetPercentage
                }))
              })),
              isLoading,
              error
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center h-[50px] w-[350px] shadow border border-black/10 rounded-2xl">
          <a href="#" className="text-gray-500 hover:text-gray-700 mr-2">
            <i className="fas fa-arrow-left"></i>
          </a>
          <p className="text-2xl font-bold text-gray-800">GPA Analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <UserDropdown user={user} className="ml-2" />
        </div>
      </div>
    </div>
  );
};

// const MetricCard = ({ title, value, grade, trend, icon: Icon, color }) => (
//   <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-600">{title}</p>
        
//         <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//         <p className={`text-sm ${color} mt-1`}>{grade}</p>
//       </div>
//       <div
//         className={`p-3 rounded-lg ${
//           color === 'text-green-600' ? 'bg-green-100' : color === 'text-red-600' ? 'bg-red-100' : 'bg-blue-100'
//         }`}
//       >
//         <Icon
//           className={`h-6 w-6 ${
//             color === 'text-green-600'
//               ? 'text-green-600'
//               : color === 'text-red-600'
//               ? 'text-red-600'
//               : 'text-blue-600'
//           }`}
//         />
//       </div>
//     </div>
//     {trend && (
//       <div className="mt-4 flex items-center">
//         {trend > 0 ? (
//           <span className="inline-flex items-center text-green-600">
//             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
//             </svg>
//             {Math.abs(trend)}% from last assessment
//           </span>
//         ) : (
//           <span className="inline-flex items-center text-red-600">
//             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//             </svg>
//             {Math.abs(trend)}% from last assessment
//           </span>
//         )}
//       </div>
//     )}
//   </div>
// );

// const CriteriaCard = ({ criteria, expanded, onToggle }) => {
//   const progress = (criteria.score / criteria.target) * 100;
//   const progressColor = progress >= 100 ? 'bg-green-500' : progress >= 80 ? 'bg-yellow-500' : 'bg-red-500';

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//       <div className="p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">{criteria.title}</h3>
//             <p className="text-sm text-gray-600 mt-1">{criteria.description}</p>
//           </div>
//           <div className="flex items-center">
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//               criteria.status === 'Above Target' ? 'bg-green-100 text-green-800' :
//               criteria.status === 'Below Target' ? 'bg-red-100 text-red-800' :
//               'bg-yellow-100 text-yellow-800'
//             }`}>
//               {criteria.status}
//             </span>
//             <button
//               onClick={onToggle}
//               className="ml-4 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
//             >
//               {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//             </button>
//           </div>
//         </div>
        
//         <div className="mt-4">
//           <div className="flex justify-between text-sm text-gray-600 mb-1">
//             <span>Progress</span>
//             <span>{criteria.score.toFixed(1)} / {criteria.target}</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className={`h-2 rounded-full ${progressColor}`}
//               style={{ width: `${Math.min(progress, 100)}%` }}
//             ></div>
//           </div>
//         </div>
//       </div>
      
//       {expanded && (
//         <div className="border-t border-gray-200 p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {criteria.subcriteria.map((sub, index) => (
//               <div key={index} className="bg-gray-50 p-4 rounded-lg">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h4 className="font-medium text-gray-900">{sub.code} - {sub.title}</h4>
//                     <p className="text-sm text-gray-600 mt-1">
//                       Score: {sub.score} / {sub.target}
//                     </p>
//                   </div>
//                   <span className={`px-2 py-0.5 rounded text-xs font-medium ${
//                     sub.score >= sub.target ? 'bg-green-100 text-green-800' :
//                     sub.score >= 2.5 ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {sub.score >= sub.target ? 'Met' : 'Not Met'}
//                   </span>
//                 </div>
//                 <div className="mt-2">
//                   <div className="w-full bg-gray-200 rounded-full h-1.5">
//                     <div
//                       className={`h-1.5 rounded-full ${
//                         sub.score >= sub.target ? 'bg-green-500' :
//                         sub.score >= 2.5 ? 'bg-yellow-500' :
//                         'bg-red-500'
//                       }`}
//                       style={{ width: `${(sub.score / sub.target) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };







const GPAAnalysis = () => {
  const {
    currentGPA,
    targetGPA,
    grade,
    criteria,
    isLoading,
    error,
  } = useGpaData();
  

  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
    const { desiredGrade } = useContext(SessionContext);

  const toggleCriteria = (id) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // const radarData = criteria?.map((c) => ({
  //   criteria: `C${c.id}`,
  //   current: c.score,
  //   target: c.target
  // })) || [];

  if (isLoading) return <div className="p-8">Loading GPA data...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className={`flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar 
          navItems={navItems}
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          navigate={navigate} 
        />
      </div>
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Enhanced Title Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    GPA Analysis Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Comprehensive analysis of NAAC criteria performance</p>
                </div>
              </div>
            </div>
  
            {/* Enhanced Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Current GPA</h3>
                      <p className="text-sm text-gray-500">Your present performance</p>
                    </div>
                  </div>
                  
                </div>
                <div className="mb-3">
                  <span className="text-4xl font-bold text-gray-900">{currentGPA?.toFixed(2)}</span>
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    {grade || "Grade"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentGPA / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
  
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Target GPA</h3>
                      <p className="text-sm text-gray-500">Your desired goal</p>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-4xl font-bold text-gray-900">{targetGPA?.toFixed(2)}</span>
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    {desiredGrade || "Grade"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(targetGPA / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
  
            {/* Enhanced Overview Radar Chart */}
            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 mb-10">
              {/* <div className="text-center mb-8">
                {/* <h2 className="text-3xl font-bold text-gray-900 mb-3">Criteria Overview</h2>
                <p className="text-gray-600 text-lg">Visual representation of NAAC criteria performance</p> */}
              {/* </div> */} */
              <RadarGraphSection />
            </div>
  
            {/* Enhanced Criteria Breakdown */}
            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Criteria Summary</h2>
                <p className="text-gray-600 text-lg">Detailed performance for each criterion and sub-criterion</p>
              </div>
  
              <div className="space-y-6">
                {criteria?.map(c => (
                  <div key={c.id} className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div
                      className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 cursor-pointer hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                      onClick={() => toggleCriteria(c.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{c.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              c.status === 'Completed' ? 'bg-green-500' : 
                              c.status === 'In Progress' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></span>
                            {c.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Current / Target</div>
                          <div className="text-lg font-bold text-gray-900">
                            {c.score} / {c.target}
                          </div>
                        </div>
                        <div className={`transform transition-transform duration-200 ${
                          expandedCriteria[c.id] ? 'rotate-180' : ''
                        }`}>
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
  
                    {expandedCriteria[c.id] && (
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="grid gap-4">
                          {c.subcriteria?.map((sub) => (
                            <div key={sub.code} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      {sub.code}
                                    </span>
                                    <h5 className="font-semibold text-gray-900">{sub.title}</h5>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      Score: <span className="font-medium text-gray-900">{sub.score}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      Grade: <span className="font-medium text-gray-900">{sub.grade}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 mb-1">Target</div>
                                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                    {sub.targetPercentage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GPAAnalysis;



