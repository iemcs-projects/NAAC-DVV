import React, { useState } from 'react';
const Navbar=()=>{
    return(
         <div className="bg-white p-3 border-b flex items-center justify-between">
        <div className="flex space-x-2 text-sm">
          <a href="#" className="text-blue-600 hover:underline cursor-pointer">Overview</a>
          <span>/</span>
          <a href="#" className="text-blue-600 hover:underline cursor-pointer">Data entry</a>
          <span>/</span>
          <a href="#" className="text-blue-600 hover:underline cursor-pointer">Metrics</a>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Academic Year:</span> <span className="font-medium text-gray-900">2023-24</span>
        </div>
      </div>
    )
   
}
export default Navbar;
