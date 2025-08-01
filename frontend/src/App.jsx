import React from "react";
import PrivateRoute from "./protectedroute.jsx";
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import {AuthProvider}  from "./auth/authProvider.jsx";
import {GpaProvider}  from "./contextprovider/GpaContext.jsx";
import Dashboard_admin from "./Dashboard_admin.jsx";
import HelpSupport from "./helpsupport.jsx";
import Notification from "./Notification.jsx";
import LandingPage from "./landing_page.jsx";
import Register from "./register.jsx";
import Login from "./Login.jsx";
import IqacDashboard from "./iqac-dashboard.jsx";
import UserManagement from "./usermanagement.jsx";
import Dashboard_faculty from "./fac-dashboard.jsx";
import Dashboard_HOD from "./hod-dashboard.jsx";
import GPAAnalysis from "./gpa.jsx";
import IIQA from "./iiqa.jsx";
import gpaAnalysis from "./gpa.jsx";
import { SessionProvider } from "./contextprovider/sessioncontext.jsx";
import ExtendedProfile from "./extendedprofile.jsx";
import Criteria1_1_1 from "./criteria1/criteria1.1/criteria1.1.1.jsx";
import Criteria1_1_2 from "./criteria1/criteria1.1/criteria1.1.2.jsx";
import Criteria1_1_3 from "./criteria1/criteria1.1/criteria1.1.3.jsx";
import Criteria1_2_1 from "./criteria1/criteria1.2/criteria1.2.1.jsx";
import Criteria1_2_2 from "./criteria1/criteria1.2/criteria1.2.2.jsx";
import Criteria1_2_3 from "./criteria1/criteria1.2/criteria1.2.3.jsx";
import Criteria1_3_1 from "./criteria1/criteria1.3/criteria1.3.1.jsx";
import Criteria1_3_2 from "./criteria1/criteria1.3/criteria1.3.2.jsx";
import Criteria1_3_3 from "./criteria1/criteria1.3/criteria1.3.3.jsx";
import Criteria1_4_1 from "./criteria1/criteria1.4/criteria1.4.1.jsx";
import Criteria1_4_2 from "./criteria1/criteria1.4/criteria1.4.2.jsx";

import Criteria2_1_1 from "./criteria2/criteria2.1/criteria2.1.1.jsx";
import Criteria2_1_2 from "./criteria2/criteria2.1/criteria2.1.2.jsx";
import Criteria2_2_1 from "./criteria2/criteria2.2/criteria2.2.1.jsx";
import Criteria2_2_2 from "./criteria2/criteria2.2/criteria2.2.2.jsx";
import Criteria2_3_1 from "./criteria2/criteria2.3/criteria2.3.1.jsx";
import Criteria2_3_2 from "./criteria2/criteria2.3/criteria2.3.2.jsx";
import Criteria2_3_3 from "./criteria2/criteria2.3/criteria2.3.3.jsx";
import Criteria2_4_1 from "./criteria2/criteria2.4/criteria2.4.1.jsx";
import Criteria2_4_2 from "./criteria2/criteria2.4/criteria2.4.2.jsx";
import Criteria2_4_3 from "./criteria2/criteria2.4/criteria2.4.3.jsx";
import Criteria2_5_1 from "./criteria2/criteria2.5/criteria2.5.1.jsx";
import Criteria2_5_2 from "./criteria2/criteria2.5/criteria2.5.2.jsx";
import Criteria2_6_1 from "./criteria2/criteria2.6/criteria2.6.1.jsx";
import Criteria2_6_2 from "./criteria2/criteria2.6/criteria2.6.2.jsx";
import Criteria2_6_3 from "./criteria2/criteria2.6/criteria2.6.3.jsx";
import Criteria2_7_1 from "./criteria2/criteria2.1/criteria2.1.1.jsx";

import Criteria3_1_1 from "./criteria3/criteria3.1/criteria3.1.1.jsx";
import Criteria3_1_2 from "./criteria3/criteria3.1/criteria3.1.2.jsx";
import Criteria3_1_3 from "./criteria3/criteria3.1/criteria3.1.3.jsx";
import Criteria3_2_1 from "./criteria3/criteria3.2/criteria3.2.1.jsx";
import Criteria3_2_2 from "./criteria3/criteria3.2/criteria3.2.2.jsx";
import Criteria3_3_1 from "./criteria3/criteria3.3/criteria3.3.1.jsx";
import Criteria3_3_2 from "./criteria3/criteria3.3/criteria3.3.2.jsx";
import Criteria3_3_3 from "./criteria3/criteria3.3/criteria3.3.3.jsx";
import Criteria3_3_4 from "./criteria3/criteria3.3/criteria3.3.4.jsx";
import Criteria3_4_1 from "./criteria3/criteria3.4/criteria3.4.1.jsx";
import Criteria3_4_2 from "./criteria3/criteria3.4/criteria3.4.2.jsx";

import Criteria4_1_1 from "./criteria4/criteria4.1/criteria4.1.1.jsx";
import Criteria4_1_2 from "./criteria4/criteria4.1/criteria4.1.2.jsx";
import Criteria4_1_3 from "./criteria4/criteria4.1/criteria4.1.3.jsx";
import Criteria4_1_4 from "./criteria4/criteria4.1/criteria4.1.4.jsx";
import Criteria4_2_1 from "./criteria4/criteria4.2/criteria4.2.1.jsx";
import Criteria4_2_2 from "./criteria4/criteria4.2/criteria4.2.2.jsx";
import Criteria4_2_3 from "./criteria4/criteria4.2/criteria4.2.3.jsx";
import Criteria4_2_4 from "./criteria4/criteria4.2/criteria4.2.4.jsx";
import Criteria4_3_1 from "./criteria4/criteria4.3/criteria4.3.1.jsx";
import Criteria4_3_2 from "./criteria4/criteria4.3/criteria4.3.2.jsx";
import Criteria4_3_3 from "./criteria4/criteria4.3/criteria4.3.3.jsx";
import Criteria4_4_1 from "./criteria4/criteria4.4/criteria4.4.1.jsx";
import Criteria4_4_2 from "./criteria4/criteria4.4/criteria4.4.2.jsx";

import Criteria5_1_1 from "./criteria5/criteria5.1/criteria5.1.1.jsx";
import Criteria5_1_2 from "./criteria5/criteria5.1/criteria5.1.2.jsx";
import Criteria5_1_3 from "./criteria5/criteria5.1/criteria5.1.3.jsx";
import Criteria5_1_4 from "./criteria5/criteria5.1/criteria5.1.4.jsx";
import Criteria5_1_5 from "./criteria5/criteria5.1/criteria5.1.5.jsx";
import Criteria5_2_1 from "./criteria5/criteria5.2/criteria5.2.1.jsx";
import Criteria5_2_2 from "./criteria5/criteria5.2/criteria5.2.2.jsx";
import Criteria5_2_3 from "./criteria5/criteria5.2/criteria5.2.3.jsx";
import Criteria5_3_1 from "./criteria5/criteria5.3/criteria5.3.1.jsx";
import Criteria5_3_2 from "./criteria5/criteria5.3/criteria5.3.2.jsx";
import Criteria5_3_3 from "./criteria5/criteria5.3/criteria5.3.3.jsx";
import Criteria5_4_1 from "./criteria5/criteria5.4/criteria5.4.1.jsx";
import Criteria5_4_2 from "./criteria5/criteria5.4/criteria5.4.2.jsx";

import Criteria6_1_1 from "./criteria6/criteria6.1/criteria6.1.1.jsx";
import Criteria6_1_2 from "./criteria6/criteria6.1/criteria6.1.2.jsx";
import Criteria6_2_1 from "./criteria6/criteria6.2/criteria6.2.1.jsx";
import Criteria6_2_2 from "./criteria6/criteria6.2/criteria6.2.2.jsx";
import Criteria6_2_3 from "./criteria6/criteria6.2/criteria6.2.3.jsx";
import Criteria6_3_1 from "./criteria6/criteria6.3/criteria6.3.1.jsx";
import Criteria6_3_2 from "./criteria6/criteria6.3/criteria6.3.2.jsx";
import Criteria6_3_3 from "./criteria6/criteria6.3/criteria6.3.3.jsx";
import Criteria6_3_4 from "./criteria6/criteria6.3/criteria6.3.4.jsx";
import Criteria6_3_5 from "./criteria6/criteria6.3/criteria6.3.5.jsx";
import Criteria6_4_1 from "./criteria6/criteria6.4/criteria6.4.1.jsx";
import Criteria6_4_2 from "./criteria6/criteria6.4/criteria6.4.2.jsx";
import Criteria6_4_3 from "./criteria6/criteria6.4/criteria6.4.3.jsx";
import Criteria6_5_1 from "./criteria6/criteria6.5/criteria6.5.1.jsx";
import Criteria6_5_2 from "./criteria6/criteria6.5/criteria6.5.2.jsx";
import Criteria7_1_1 from "./criteria7/criteria7.1/criteria7.1.1.jsx";
import Criteria7_1_2 from "./criteria7/criteria7.1/criteria7.1.2.jsx";
import Criteria7_1_3 from "./criteria7/criteria7.1/criteria7.1.3.jsx";
import Criteria7_1_4 from "./criteria7/criteria7.1/criteria7.1.4.jsx";
import Criteria7_1_5 from "./criteria7/criteria7.1/criteria7.1.5.jsx";
import Criteria7_1_6 from "./criteria7/criteria7.1/criteria7.1.6.jsx";
import Criteria7_1_7 from "./criteria7/criteria7.1/criteria7.1.7.jsx";
import Criteria7_1_8 from "./criteria7/criteria7.1/criteria7.1.8.jsx";
import Criteria7_1_9 from "./criteria7/criteria7.1/criteria7.1.9.jsx";
import Criteria7_1_10 from "./criteria7/criteria7.1/criteria7.1.10.jsx";
import Criteria7_1_11 from "./criteria7/criteria7.1/criteria7.1.11.jsx";
import Criteria7_2_1 from "./criteria7/criteria7.2/criteria7.2.1.jsx";
import Criteria7_3_1 from "./criteria7/criteria7.3/criteria7.3.1.jsx";
import { GpaDataProvider } from "./contextprovider/gpadata.jsx";




function App() {
  return (
    <AuthProvider>
      <GpaDataProvider>
      <GpaProvider>
    <SessionProvider>
      <div className="min-h-screen w-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected IQAC Supervisor Routes */}
          <Route
            path='/iqac-dashboard'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <IqacDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path='/user-management'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path='/gpa-analysis'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <GPAAnalysis />
              </PrivateRoute>
            }
          />
          <Route
            path='/iiqa'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <IIQA />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path='/admin-dashboard'
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Dashboard_admin />
              </PrivateRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path='/fac-dashboard'
            element={
              <PrivateRoute allowedRoles={['Faculty']}>
                <Dashboard_faculty />
              </PrivateRoute>
            }
          />

          {/* HOD Routes */}
          <Route
            path='/hod-dashboard'
            element={
              <PrivateRoute allowedRoles={['HOD']}>
                <Dashboard_HOD />
              </PrivateRoute>
            }
          />

          {/* Common Protected Routes */}
          <Route
            path='/extendedprofile'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin', 'Faculty', 'HOD']}>
                <ExtendedProfile />
              </PrivateRoute>
            }
          />
          <Route
            path='/notification'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin', 'Faculty', 'HOD']}>
                <Notification />
              </PrivateRoute>
            }
          />
          <Route
            path='/helpsupport'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin', 'Faculty', 'HOD']}>
                <HelpSupport />
              </PrivateRoute>
            }
          />

          {/* Criteria Routes (if they require auth, wrap each in <PrivateRoute>) */}
          <Route
            path='/criteria1.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_1_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_1_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.1.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_1_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.2.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_2_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.2.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_2_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.2.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_2_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_3_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.3.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_3_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.3.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_3_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.4.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_4_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria1.4.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria1_4_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_1_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_1_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.2.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_2_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.2.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_2_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_3_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.3.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_3_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.3.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_3_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.4.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_4_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.4.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_4_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.4.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_4_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.5.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_5_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.5.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_5_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.6.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_6_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.6.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_6_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.6.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_6_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria2.7.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_7_1 />
              </PrivateRoute>
            }
          />
           <Route
            path='/criteria6.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria2_7_1 />
              </PrivateRoute>
            }
          />
             <Route
            path='/criteria6.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_1_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_1_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_2_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.2.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_2_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.2.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_2_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_3_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.3.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_3_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.3.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_3_3 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.3.4'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_3_4/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.3.5'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_3_5 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.4.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_4_1 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.4.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_4_2 />
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.4.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_4_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.5.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_5_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria6.5.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria6_5_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_1_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_1_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.1.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_1_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.2.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_2_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.2.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_2_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_3_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.3.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_3_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.3.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_3_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.3.4'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_3_4/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.4.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_4_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria3.4.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria3_4_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_1_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_1_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.1.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_1_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.1.4'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_1_4/>
              </PrivateRoute>
            }
          />
    
    <Route
            path='/criteria4.2.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_2_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.2.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_2_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.2.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_2_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.2.4'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_2_4/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_3_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.3.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_3_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.3.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_3_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.4.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_4_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria4.4.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria4_4_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_1_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_1_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.1.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_1_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.1.4'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_1_4/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.1.5'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_1_5/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.2.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_2_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.2.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_2_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.2.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_2_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_3_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.3.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_3_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.3.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_3_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.4.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_4_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria5.4.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria5_4_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.2'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_2/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.3'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_3/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.4'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_4/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.5'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_5/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.6'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_6/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.7'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_7/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.8'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_8/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.9'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_9/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.10'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_10/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.1.11'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_1_11/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.2.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_2_1/>
              </PrivateRoute>
            }
          />
          <Route
            path='/criteria7.3.1'
            element={
              <PrivateRoute allowedRoles={['iqac', 'admin']}>
                <Criteria7_3_1/>
              </PrivateRoute>
            }
          />

          {/* Repeat above pattern for all other Criteria routes */}

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
     
    </SessionProvider>
    </GpaProvider>
    </GpaDataProvider>
    </AuthProvider>
    
  );
}

export default App;






