import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import {
  MdOutlineDoubleArrow,
  MdDashboard,
  MdOutlineAssignment,
  MdWorkOutline,
} from "react-icons/md";
import {
  FaUsers,
  FaCalendarCheck,
  FaBuilding,
  FaMoneyBillWave,
  FaChartLine,
  FaChalkboardTeacher,
  FaFileAlt,
} from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { IoMdListBox } from "react-icons/io";
import { GiPayMoney } from "react-icons/gi";
import { IoLogOut } from "react-icons/io5";

import zemaltlogo from "./Assets/zemalt-logo.png";

// Pages
import Dashboard from "./Pages/Dashboard/Dashboard";
import Employees from "./Pages/Categories/Employee";
import Departments from "./Pages/Categories/Departments";
import Designations from "./Pages/Categories/Designation";
import Attendance from "./Pages/Categories/Attendance";
import Leaves from "./Pages/Categories/Leaves";
import Jobs from "./Pages/Categories/Jobs";
import Applications from "./Pages/Categories/Applications";
import Payroll from "./Pages/Categories/Payroll";
import Performance from "./Pages/Categories/Appraisal";
import Training from "./Pages/Categories/Training";
import Fines from "./Pages/Categories/Fine";
import Reports from "./Pages/Categories/Reports";
import Users from "./Pages/Categories/Users";
import Roles from "./Pages/Categories/Roles";
import { fetchRoleByName } from "./DAL/fetch";

//MENU ITEMS
// Menu Icon Map
const allMenuItems = {
  Dashboard: { route: "/dashboard", icon: <MdDashboard /> },
  Users: { route: "/users", icon: <FaUsers /> },
  Roles: { route: "/roles", icon: <HiUserGroup /> },  
  Departments: { route: "/departments", icon: <FaBuilding /> },
  Designations: { route: "/designations", icon: <HiUserGroup /> },
  Employees: { route: "/employees", icon: <FaUsers /> },
  Attendance: { route: "/attendance", icon: <FaCalendarCheck /> },
  Leaves: { route: "/leaves", icon: <IoMdListBox /> },
  Performance: { route: "/performance", icon: <FaChartLine /> },
  Training: { route: "/training", icon: <FaChalkboardTeacher /> },
  Payroll: { route: "/payroll", icon: <FaMoneyBillWave /> },
  Fines: { route: "/fines", icon: <GiPayMoney /> },
  Jobs: { route: "/jobs", icon: <MdWorkOutline /> },
  Applications: { route: "/applications", icon: <MdOutlineAssignment /> },
  Reports: { route: "/reports", icon: <FaFileAlt /> },
};

// Pages Map
const pageComponents = {
  Dashboard,
  Users,
  Roles,
  Departments,
  Designations,
  Employees,
  Attendance,
  Leaves,
  Performance,
  Training,
  Payroll,
  Fines,
  Jobs,
  Applications,
  Reports
};

// ProtectedRoute Component
const ProtectedRoute = ({ component: Component, allowed }) => {
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <Component />;
};

const App = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  // const [roleModules, setRoleModules] = useState([]); // modules array from backend

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user?.role) {
  //     // Fetch allowed modules dynamically for this role
  //     axios
  // .get(`http://localhost:5009/roles/getRoleByName/${user.role}`)
  // .then((res) => setRoleModules(res.data.modules || []))
  // .catch(console.error);

  //   }
  // }, []);
    const [roleModules, setRoleModules] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      fetchRoleByName(user.role)
        .then((res) => setRoleModules(res.modules || []))
        .catch(console.error);
    }
  }, []);

  const menuItems = Object.keys(allMenuItems)
    .filter((name) => roleModules.includes(name))
    .map((name) => ({ name, ...allMenuItems[name] }));

  useEffect(() => {
    const currentItem = menuItems.find((item) => item.route === location.pathname);
    setActiveItem(currentItem?.name || null);
  }, [location.pathname, menuItems]);

  const handleItemClick = (item) => {
    setActiveItem(item.name);
    navigate(item.route);
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="App">
      {/* Sidebar */}
      <div className={`app-side-bar ${isOpen ? "open" : "closed"}`}>
        <div className="opencloseicon" onClick={toggleMenu}>
          <MdOutlineDoubleArrow className={isOpen ? "rotated" : ""} />
        </div>

        <img src={zemaltlogo} className="home-zemalt-logo" alt="zemalt Logo" />

        <ul>
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={activeItem === item.name ? "selected-item" : "unselected"}
              onClick={() => handleItemClick(item)}
            >
              {item.icon}
              {isOpen && <span>{item.name}</span>}
            </li>
          ))}
          <li className="unselected" onClick={onLogout}>
            <IoLogOut />
            {isOpen && <span>Logout</span>}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="app-right">
        <Routes>
          {Object.keys(pageComponents).map((name) => (
            <Route
              key={name}
              path={allMenuItems[name]?.route || "/dashboard"}
              element={
                <ProtectedRoute
                  component={pageComponents[name]}
                  allowed={roleModules.includes(name)}
                />
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
