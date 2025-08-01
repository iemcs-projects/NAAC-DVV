// Dashboard.jsx
import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const Dashboard_HOD = () => {
  const criteria = [
    { id: 1, name: "Curricular Aspects", score: 78, target: 90 },
    { id: 2, name: "Teaching-Learning and Evaluation", score: 85, target: 95 },
    { id: 3, name: "Research, Innovations and Extension", score: 65, target: 85 },
    { id: 4, name: "Infrastructure and Learning Resources", score: 72, target: 80 },
    { id: 5, name: "Student Support and Progression", score: 68, target: 75 },
    { id: 6, name: "Governance, Leadership and Management", score: 80, target: 90 },
    { id: 7, name: "Institutional Values and Best Practices", score: 75, target: 85 }
  ];

  useEffect(() => {
    const chartDom = document.getElementById('criteria-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Actual Score', 'Target Score'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: criteria.map(c => `Criterion ${c.id}`) },
        yAxis: { type: 'value', max: 100, name: 'Score', nameLocation: 'middle', nameGap: 40 },
        series: [
          { name: 'Actual Score', type: 'bar', data: criteria.map(c => c.score), itemStyle: { color: '#1a73e8' } },
          { name: 'Target Score', type: 'bar', data: criteria.map(c => c.target), itemStyle: { color: '#34a853' } }
        ]
      };
      myChart.setOption(option);

      window.addEventListener('resize', () => myChart.resize());
      return () => {
        window.removeEventListener('resize', () => myChart.resize());
        myChart.dispose();
      };
    }
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-screen text-black">
      <h2 className="text-2xl font-bold mb-6">HOD Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Desired Grade</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">A++</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Projected Grade</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">A+</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Pending Validations</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">12</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Submission Deadline</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">5 Days</h2>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Actual vs Target Score by Criterion</h3>
        <div id="criteria-chart" style={{ height: '300px', width: '100%' }}></div>
      </div>
    </div>
  );
};

export default Dashboard_HOD;
