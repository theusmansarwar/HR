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
import { Tooltip } from "@mui/material";

import zemaltlogo from "./Assets/HR-new.png";
import { fetchRoleByName } from "./DAL/fetch";

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
import { IoIosArrowForward } from "react-icons/io";
import Activity from "./Pages/Categories/ActivityLogs"

const allMenuItems = [
  { id: 1, name: "Dashboard", route: "/dashboard", icon: <MdDashboard /> },
  { id: 2, name: "Users", route: "/users", icon: <FaUsers /> },
  { id: 3, name: "Roles", route: "/roles", icon: <HiUserGroup /> },
  { id: 4, name: "Departments", route: "/departments", icon: <FaBuilding /> },
  { id: 5, name: "Designations", route: "/designations", icon: <HiUserGroup /> },
  { id: 6, name: "Employees", route: "/employees", icon: <FaUsers /> },
  {
    id: 7,
    name: "Presence",
    icon: <FaCalendarCheck />,
    children: [
      { id: 71, name: "Attendance", route: "/attendance", icon: <FaCalendarCheck /> },
      { id: 72, name: "Leaves", route: "/leaves", icon: <IoMdListBox /> },
    ],
  },
  { id: 8, name: "Performance", route: "/performance", icon: <FaChartLine /> },
  {
    id: 9,
    name: "Jobs & Training",
    icon: <MdWorkOutline />,
    children: [
      { id: 91, name: "Jobs", route: "/jobs", icon: <MdWorkOutline /> },
      { id: 92, name: "Applications", route: "/applications", icon: <MdOutlineAssignment /> },
      { id: 93, name: "Training", route: "/training", icon: <FaChalkboardTeacher /> },
    ],
  },
  { id: 10, name: "Payroll", route: "/payroll", icon: <FaMoneyBillWave /> },
  { id: 11, name: "Fines", route: "/fines", icon: <GiPayMoney /> },
  { id: 12, name: "Reports", route: "/reports", icon: <FaFileAlt /> },
  { id: 13, name: "Activity", route: "/activity", icon: <FaFileAlt /> },
];

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
  Reports,
  Activity,
};

const ProtectedRoute = ({ component: Component, allowed }) => {
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <Component />;
};

const App = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [roleModules, setRoleModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  setRoleModules(user.modules || []);
  // if (user?.role) {
  //   fetchRoleByName(user.role)
  //     .then((res) => {
  //       setRoleModules(res.modules || []);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       setLoading(false);
  //     });
  // } else {
  //   setLoading(false);
  // }
}, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

const handleItemClick = (item) => {
  if (item.children) {
    setOpenSubmenu((prev) => (prev === item.name ? null : item.name));
    setActiveItem(item.name); 
  } else {
    setOpenSubmenu(null);
    setActiveItem(item.name);
    navigate(item.route);
  }
};

  const handleSubItemClick = (subItem) => {
    setActiveItem(subItem.name);
    navigate(subItem.route);
  };

  useEffect(() => {
    const current = allMenuItems
      .flatMap((item) => (item.children ? item.children : item))
      .find((i) => i.route === location.pathname);
    setActiveItem(current?.name || null);
  }, [location.pathname]);

  // const filteredMenu = allMenuItems
  //   .map((item) => {
  //     if (item.children) {
  //       const allowedChildren = item.children.filter((child) =>
  //         roleModules.includes(child.name)
  //       );
  //       if (allowedChildren.length > 0) {
  //         return { ...item, children: allowedChildren };
  //       }
  //       return null;
  //     }
  //     return roleModules.includes(item.name) ? item : null;
  //   })
  //   .filter(Boolean);
const filteredMenu = allMenuItems
  .map((item) => {
    if (item.children) {
      // Filter children based on roleModules
      const allowedChildren = item.children.filter((child) =>
        roleModules.includes(child.name)
      );
      if (allowedChildren.length > 0) {
        return { ...item, children: allowedChildren };
      }
      return null;
    }
    // Filter top-level menu items based on roleModules
    return roleModules.includes(item.name) ? item : null;
  })
  .filter(Boolean); // Remove null values from the filtered menu

  return (
    <div className="App">
      <div className={`app-side-bar ${isOpen ? "open" : "closed"}`}>
        <div className="opencloseicon" onClick={toggleMenu}>
          <MdOutlineDoubleArrow className={isOpen ? "rotated" : ""} />
        </div>

        <img src={zemaltlogo} className="home-zemalt-logo" alt="Zemalt Logo" />

        <ul>
          {filteredMenu.map((item) => (
            <li key={item.id}>
              <Tooltip title={!isOpen ? item.name : ""} placement="right" arrow>
                {/* <div
                  className={`menu-item ${
                    activeItem === item.name ? "selected-item" : "unselected"
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon}
                  {isOpen && <span>{item.name}</span>}
                </div> */}
                <div
  className={`menu-item ${activeItem === item.name ? "selected-item" : "unselected"}`}
  onClick={() => handleItemClick(item)}
>
  {item.icon}
  {isOpen && <span className="menu-item-name">{item.name}</span>}
  {isOpen && item.children && (
    <IoIosArrowForward
      className={`menu-item-arrow ${
        openSubmenu === item.name ? "arrow-open" : ""
      }`}
    />
  )}
</div>

              </Tooltip>

              {item.children && openSubmenu === item.name && (
                <ul className="submenu">
                  {item.children.map((child) => (
                    <Tooltip
                      key={child.id}
                      title={!isOpen ? child.name : ""}
                      placement="right"
                      arrow
                    >
                      <li
                        className={`submenu-item ${
                          activeItem === child.name
                            ? "selected-item"
                            : "unselected"
                        }`}
                        onClick={() => handleSubItemClick(child)}
                      >
                        {child.icon}
                        {isOpen && <span>{child.name}</span>}
                      </li>
                    </Tooltip>
                  ))}
                </ul>
              )}
            </li>
          ))}

          <Tooltip title={!isOpen ? "Logout" : ""} placement="right" arrow>
            <li className="unselected logout-item" onClick={onLogout}>
              <IoLogOut />
              {isOpen && <span>Logout</span>}
            </li>
          </Tooltip>
        </ul>
      </div>

      {/* <div className="app-right">
        <Routes>
          {Object.keys(pageComponents).map((name) => (
            <Route
              key={name}
              path={`/${name.toLowerCase()}`}
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
      </div> */}
      <div className="app-right">
  {loading ? (
    <div style={{ padding: "20px" }}>Loading...</div>
  ) : (
    <Routes>
      {Object.keys(pageComponents).map((name) => (
        <Route
          key={name}
          path={`/${name.toLowerCase()}`}
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
  )}
</div>

    </div>
  );
};

export default App;
