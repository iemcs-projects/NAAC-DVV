import React from "react";




const Bottom = ({ onNext, onPrevious, onExport, onSubmit }) => {
  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={onPrevious}
        className="!bg-white !text-blue-600 !border-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
      >
        ← Previous
      </button>

      <div className="flex space-x-4">
        <button
          onClick={onExport}
          className="!bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:!bg-blue-700 transition duration-200"
        >
          Export data
        </button>
        <button
          onClick={onSubmit}
          className="!bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:!bg-blue-700 transition duration-200"
        >
          Submit entry
        </button>
      </div>

      <button
        onClick={onNext}
        className="!bg-white !text-blue-600 !border-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
      >
        Next →
      </button>
    </div>
  );
};

export default Bottom;
