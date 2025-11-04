import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import { MdOutlineDoubleArrow, MdDashboard, MdOutlineAssignment, MdWorkOutline } from "react-icons/md";
import { FaUsers, FaCalendarCheck, FaBuilding, FaMoneyBillWave, FaChartLine, FaChalkboardTeacher, FaFileAlt } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { IoMdListBox } from "react-icons/io";
import { GiPayMoney } from "react-icons/gi";
import { IoLogOut } from "react-icons/io5";
import { Tooltip, Snackbar, Alert, Backdrop, CircularProgress, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import Activity from "./Pages/Categories/ActivityLogs";
import Archive from "./Pages/Categories/Archive"

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
   { id: 14, name: "Archive", route: "/archive", icon: <FaFileAlt /> },
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
  Archive
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setRoleModules(user.modules || []);
    setLoading(false);
    console.log("User modules from localStorage:", user.modules);
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

  const handleLogout = async () => {
    // Start logout process
    setIsLoggingOut(true);
    
    // Show initial message
    setSnackbar({
      open: true,
      message: "Logging out...",
      severity: "info",
    });

    // Wait a moment for visual feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update to success message
    setSnackbar({
      open: true,
      message: "Logged out successfully",
      severity: "success",
    });

    // Wait for success message to be visible
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Perform actual logout
    onLogout();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredMenu = allMenuItems
    .map((item) => {
      if (item.children) {
        const allowedChildren = item.children.filter((child) =>
          roleModules.includes(child.name)
        );
        if (allowedChildren.length > 0) {
          return { ...item, children: allowedChildren };
        }
        return null;
      }
      return roleModules.includes(item.name) ? item : null;
    })
    .filter(Boolean);

  return (
    <div className="App">
      <Fade in={!isLoggingOut} timeout={500}>
        <div style={{ display: isLoggingOut ? 'none' : 'contents' }}>
          <div className={`app-side-bar ${isOpen ? "open" : "closed"}`}>
            <div className="opencloseicon" onClick={toggleMenu}>
              <MdOutlineDoubleArrow className={isOpen ? "rotated" : ""} />
            </div>
            <img src={zemaltlogo} className="home-zemalt-logo" alt="Zemalt Logo" />
            <ul>
              {filteredMenu.map((item) => (
                <li key={item.id}>
                  <Tooltip title={!isOpen ? item.name : ""} placement="right" arrow>
                    <div
                      className={`menu-item ${
                        activeItem === item.name ? "selected-item" : "unselected"
                      }`}
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
                              activeItem === child.name ? "selected-item" : "unselected"
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
                <li 
                  className="unselected logout-item" 
                  onClick={handleLogout}
                  style={{ 
                    opacity: isLoggingOut ? 0.5 : 1, 
                    pointerEvents: isLoggingOut ? 'none' : 'auto' 
                  }}
                >
                  <IoLogOut />
                  {isOpen && <span>Logout</span>}
                </li>
              </Tooltip>
            </ul>
          </div>

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
      </Fade>

      {/* Professional Logout Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={isLoggingOut}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '20px' 
        }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: '#fff' }}
          />
          <div style={{
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}>
            Logging out securely...
          </div>
        </div>
      </Backdrop>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '15px',
            fontWeight: 500
          }}
          icon={snackbar.severity === 'success' ? <CheckCircleIcon fontSize="inherit" /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;