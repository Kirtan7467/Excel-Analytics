import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./components/Starting Items/Signup";
import Login from "./components/Starting Items/Login";
import Dashboard from "./components/Dashboard";
import AdminSignup from "./components/Starting Items/AdminSignup";
import AdminLogin from "./components/Starting Items/AdminLogin";
import Start from "./components/Starting Items/Start";
import DataView from "./components/DataView";
import Files from "./components/Files";
import User from "./components/User";
import Chart from "./components/Chart";
import AdminDashboard from "./components/AdminDashboard";
import History from "./components/History";
import UserControl from "./components/UserControl";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/data-view/:id" element={<DataView />} />
        <Route path="/files" element={<Files />} />
        <Route path="/admin-files" element={<Files />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin-users" element={<User />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/admin-charts" element={<Chart />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin-user-control" element={<UserControl />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
