import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  MenuItem, 
  TextField, 
  Typography, 
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fetchReports } from "../../DAL/fetch";
import { createReport } from "../../DAL/create";
import { deleteReport } from "../../DAL/delete";
import { 
  fetchEmployees, 
  fetchPayrolls, 
  fetchPerformance, 
  fetchFines, 
  fetchApplications 
} from "../../DAL/fetch";

const reportTypes = ["Employees", "Payroll", "Performance", "Fines", "Applications"];

// Fields to exclude from table display
const excludeFields = ['_id', 'id', '__v', 'password', 'token', 'createdAt', 'updatedAt', '__typename'];

// Specific field configurations for each report type
const reportFieldConfig = {
  Employees: [
    { key: 'employeeId', label: 'Employee ID', paths: ['employeeId', 'employee.employeeId', 'id'] },
    { key: 'firstName', label: 'First Name', paths: ['firstName', 'employee.firstName'] },
    { key: 'lastName', label: 'Last Name', paths: ['lastName', 'employee.lastName'] },
    { key: 'email', label: 'Email', paths: ['email', 'employee.email'] },
    { key: 'phone', label: 'Phone', paths: ['phone', 'phoneNumber', 'employee.phone', 'employee.phoneNumber', 'contactNumber'] },
    { key: 'joiningDate', label: 'Joining Date', type: 'date', paths: ['joiningDate', 'employee.joiningDate', 'dateOfJoining', 'joinDate'] },
    { key: 'status', label: 'Status', paths: ['status', 'employee.status', 'employmentStatus'] },
    { key: 'salary', label: 'Salary', type: 'currency', paths: ['salary', 'employee.salary', 'basicSalary'] }
  ],
  Payroll: [
    { key: 'employeeName', label: 'Employee Name', paths: ['employeeId.firstName', 'employeeId.lastName'], },
    { key: 'month', label: 'Month', paths: ['month', 'paymentMonth'] },
    { key: 'year', label: 'Year', paths: ['year', 'paymentYear'] },
    { key: 'basicSalary', label: 'Basic Salary', type: 'currency', paths: ['basicSalary', 'basic', 'salary'] },
    { key: 'allowances', label: 'Allowances', type: 'currency', paths: ['allowances', 'allowance', 'totalAllowances'] },
    { key: 'deductions', label: 'Deductions', type: 'currency', paths: ['deductions', 'deduction', 'totalDeductions'] },
    { key: 'netSalary', label: 'Net Salary', type: 'currency', paths: ['netSalary', 'netPay', 'totalSalary'] },
    { key: 'paymentDate', label: 'Payment Date', type: 'date', paths: ['paymentDate', 'paidDate', 'date'] },
    { key: 'status', label: 'Status', paths: ['status', 'paymentStatus'] }
  ],
  Performance: [
    { key: 'performanceId', label: 'Performance ID', paths: ['performanceId', 'id', '_id'] },
    { key: 'employeeId', label: 'Employee ID', paths: ['employee.employeeId', 'employeeId', 'employee.id'] },
    { key: 'appraisalDate', label: 'Appraisal Date', type: 'date', paths: ['appraisalDate', 'reviewDate', 'date', 'evaluationDate'] },
    { key: 'score', label: 'Score', paths: ['score', 'rating', 'performanceScore', 'overallScore'] },
    { key: 'kpis', label: 'KPIs', type: 'array', paths: ['kpis', 'KPIs', 'keyPerformanceIndicators', 'metrics'] },
    { key: 'remarks', label: 'Remarks', paths: ['remarks', 'comments', 'feedback', 'notes'] },
    { key: 'status', label: 'Status', paths: ['status', 'reviewStatus'] }
  ],
  Fines: [
    { key: 'fineId', label: 'Fine ID', paths: ['fineId', 'id', '_id'] },
    { key: 'employeeName', label: 'Employee Name', paths: ['employeeId.firstName', 'employeeId.lastName'], },
    { key: 'fineType', label: 'Fine Type', paths: ['fineType', 'type', 'category'] },
    { key: 'amount', label: 'Amount', type: 'currency', paths: ['amount', 'fineAmount', 'penalty'] },
    { key: 'reason', label: 'Reason', paths: ['reason', 'description', 'details', 'remarks'] },
    { key: 'date', label: 'Date', type: 'date', paths: ['date', 'fineDate', 'issuedDate', 'createdAt'] },
    { key: 'status', label: 'Status', paths: ['status', 'paymentStatus'] }
  ],
Applications: [
    { key: 'applicationId', label: 'Application ID', paths: ['applicationId', 'id', '_id'] },
    { key: 'applicantName', label: 'Applicant Name', paths: ['applicantName'] }, 
    { key: 'applicationType', label: 'Remarks', paths: ['type', 'applicationType', 'leaveType', 'remarks'] }, 
    { key: 'status', label: 'Status', paths: ['applicationStatus'] },
    { key: 'appliedDate', label: 'Applied On', type: 'date', paths: ['appliedDate', 'applicationDate', 'submittedDate', 'createdAt'] },
    { key: 'interviewDate', label: 'Interview Date', type: 'date', paths: ['interviewDate'] }  
  ]
};

// Function to get nested value from object with multiple path attempts
const getNestedValue = (obj, paths) => {
  if (!paths) return obj;
  
  // If paths is a string, convert to array
  const pathArray = Array.isArray(paths) ? paths : [paths];
  
  // Try each path until we find a value
  for (const path of pathArray) {
    const keys = path.split('.');
    let value = obj;
    let found = true;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        found = false;
        break;
      }
    }
    
    // If we found a valid value (not null, undefined, or empty string), return it
    if (found && value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  
  return undefined;
};

// Function to extract employee info from nested objects
const extractEmployeeInfo = (value, field) => {
  if (!value) return null;
  
  // If it's already a string or number, return it
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  
  // If it's an object, try to extract meaningful data
  if (typeof value === 'object') {
    // For employeeId field - prioritize the proper employeeId format (EMP-XXXX)
    if (field === 'employeeId') {
      // Check nested employee object first
      if (value.employee) {
        if (value.employee.employeeId) return value.employee.employeeId;
        if (value.employee.id && typeof value.employee.id === 'string' && value.employee.id.startsWith('EMP-')) {
          return value.employee.id;
        }
      }
      // Check direct properties
      if (value.employeeId) return value.employeeId;
      if (value.id && typeof value.id === 'string' && value.id.startsWith('EMP-')) {
        return value.id;
      }
      // Fallback to _id only if no EMP- format found
      if (value._id) return value._id;
    }
    
    // For employeeName field - look in nested employee object
    if (field === 'employeeName') {
      if (value.employee) {
        const emp = value.employee;
        if (emp.firstName && emp.lastName) {
          return `${emp.firstName} ${emp.lastName}`;
        }
        if (emp.firstName) return emp.firstName;
        if (emp.name) return emp.name;
      }
      if (value.firstName && value.lastName) {
        return `${value.firstName} ${value.lastName}`;
      }
      if (value.firstName) return value.firstName;
      if (value.name) return value.name;
    }
    
    // For reviewerId field
    if (field === 'reviewerId') {
      if (value.reviewer && value.reviewer.employeeId) return value.reviewer.employeeId;
      if (value.reviewerId) return value.reviewerId;
      if (value.reviewer && value.reviewer.id) return value.reviewer.id;
      if (value.id) return value.id;
      if (value._id) return value._id;
    }
    
    // Generic object handling
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.label) return value.label;
    if (value.value) return value.value;
  }
  
  return null;
};

// Function to format field names nicely
const formatFieldName = (field) => {
  const customLabels = {
    employeeId: 'Employee ID',
    firstName: 'First Name',
    lastName: 'Last Name',
    basicSalary: 'Basic Salary',
    netSalary: 'Net Salary',
    joiningDate: 'Joining Date',
    appraisalDate: 'Appraisal Date',
    startDate: 'Start Date',
    endDate: 'End Date',
    appliedDate: 'Applied Date',
    paymentDate: 'Payment Date',
    employeeName: 'Employee Name',
    fineType: 'Fine Type',
    fineId: 'Fine ID',
    applicationId: 'Application ID',
    applicationType: 'Application Type',
    performanceId: 'Performance ID',
    reviewerId: 'Reviewer ID',
    kpis: 'KPIs'
  };

  if (customLabels[field]) return customLabels[field];

  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

// Function to format values nicely
const formatValue = (value, type = null, field = null) => {
  // First, extract meaningful data from nested objects
  if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
    const extracted = extractEmployeeInfo(value, field);
    if (extracted !== null) {
      value = extracted;
    } else {
      // If we couldn't extract anything meaningful, return empty
      return '';
    }
  }
  
  // Now handle null/undefined after extraction attempt
  if (value === null || value === undefined || value === '') return '';
  
  // Handle currency
  if (type === 'currency') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return `Rs. ${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return '';
  }

  // Handle arrays (like KPIs)
  if (type === 'array' || Array.isArray(value)) {
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      // Filter out empty strings and format
      const filtered = value.filter(v => v && v.toString().trim() !== '');
      if (filtered.length === 0) return '';
      return filtered.join(', ');
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return '';
        const filtered = parsed.filter(v => v && v.toString().trim() !== '');
        if (filtered.length === 0) return '';
        return filtered.join(', ');
      }
    } catch (e) {
      // If it's a string that looks like an array description, show it
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
      return '';
    }
  }
  
  // Check if it's a date string
  if (type === 'date' || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      return '';
    }
  }
  
  // Check if it's a boolean
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Check if it's an object (but not Date) - shouldn't reach here but just in case
  if (typeof value === 'object' && !(value instanceof Date)) {
    return '';
  }
  
  // Return string value, but only if it's not empty
  const strValue = value.toString().trim();
  return strValue || '';
};

// Function to filter and clean data for display
const cleanDataForDisplay = (data, reportType) => {
  if (!data || data.length === 0) return { headers: [], rows: [] };
  
  const config = reportFieldConfig[reportType];
  
  if (config) {
    // Use predefined configuration
    const headers = config.map(field => ({
      key: field.key,
      label: field.label,
      type: field.type
    }));

    const rows = data.map(item => {
      const row = {};
      config.forEach(field => {
        // Use paths if available, otherwise use key
        const paths = field.paths || [field.key];
        let value = getNestedValue(item, paths);
        
        // Try to extract from nested objects if still no value
        if ((!value || (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date))) && value !== 0) {
          const extracted = extractEmployeeInfo(value || item, field.key);
          if (extracted !== null && extracted !== undefined && extracted !== '') {
            value = extracted;
          }
        }
        
        row[field.key] = value;
      });
      return row;
    });

    return { headers, rows, config };
  } else {
    const firstItem = data[0];
    const headers = [];
    
    Object.keys(firstItem).forEach(key => {
      if (!excludeFields.includes(key) && !key.includes('Id') && key !== 'id') {
        headers.push({
          key,
          label: formatFieldName(key),
          type: null
        });
      }
    });

    const rows = data.map(item => {
      const row = {};
      headers.forEach(header => {
        row[header.key] = item[header.key];
      });
      return row;
    });

    return { headers, rows, config: null };
  }
};

const Reports = () => {
  const [reportType, setReportType] = useState("");
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [savedReports, setSavedReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // All data from backend
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [fines, setFines] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    reportId: null, 
    reportTitle: "" 
  });
  const [deleting, setDeleting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchAllData();
    fetchReportsData();
  }, []);

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const [empRes, payRes, perfRes, fineRes, appRes] = await Promise.all([
        fetchEmployees(1, 1000, ""),
        fetchPayrolls(1, 1000, ""),
        fetchPerformance(1, 1000, ""),
        fetchFines(1, 1000, ""),
        fetchApplications(1, 1000, "")
      ]);

      setEmployees(empRes?.data || empRes?.employees || []);
      setPayrolls(payRes?.data || payRes?.payrolls || []);
      setPerformance(perfRes?.data || perfRes?.performance || []);
      setFines(fineRes?.data || fineRes?.fines || []);
      setApplications(appRes?.data || appRes?.applications || []);
      
      console.log("Data fetched:", { empRes, payRes, perfRes, fineRes, appRes });
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Error loading data. Please refresh the page.",
        severity: "error"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchReportsData = async () => {
    try {
      const reports = await fetchReports();
      setSavedReports(reports?.data || reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleGenerate = () => {
    if (!reportType) {
      setSnackbar({
        open: true,
        message: "Please select a report type",
        severity: "warning"
      });
      return;
    }

    let selectedData = [];
    switch (reportType) {
      case "Employees":
        selectedData = [...employees];
        break;
      case "Payroll":
        selectedData = [...payrolls];
        break;
      case "Performance":
        selectedData = [...performance];
        break;
      case "Fines":
        selectedData = [...fines];
        break;
      case "Applications":
        selectedData = [...applications];
        break;
      default:
        selectedData = [];
    }

    console.log("Generated data:", selectedData);
    setData(selectedData);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title || !reportType) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "warning"
      });
      return;
    }

    const payload = {
      reportType,
      filter: "",
      title,
      description,
      generatedBy: "HR Admin",
      data,
    };

    setLoading(true);
    try {
      await createReport(payload);
      setSnackbar({
        open: true,
        message: "Report saved successfully!",
        severity: "success"
      });
      setTitle("");
      setDescription("");
      setReportType("");
      setData([]);
      setShowForm(false);
      fetchReportsData();
    } catch (error) {
      console.error("Error submitting report:", error);
      setSnackbar({
        open: true,
        message: "Error saving report. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setViewingReport(report);
  };

  const handleCloseReport = () => {
    setViewingReport(null);
  };

  const handleDeleteClick = (e, report) => {
    e.stopPropagation();
    setDeleteDialog({
      open: true,
      reportId: report._id || report.id,
      reportTitle: report.title
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteReport(deleteDialog.reportId);
      setSnackbar({
        open: true,
        message: "✓ Report deleted successfully!",
        severity: "success"
      });
      fetchReportsData();
      setDeleteDialog({ open: false, reportId: null, reportTitle: "" });
    } catch (error) {
      console.error("Error deleting report:", error);
      setSnackbar({
        open: true,
        message: "Error deleting report. Please try again.",
        severity: "error"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, reportId: null, reportTitle: "" });
  };

  const handleEditReport = (e, report) => {
    e.stopPropagation();
    setEditingReport(report);
    setTitle(report.title);
    setDescription(report.description || "");
    setReportType(report.reportType);
    setData(report.data || []);
    setShowForm(true);
  };

  const handleUpdateReport = async () => {
    if (!title || !reportType) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "warning"
      });
      return;
    }

    const payload = {
      reportType,
      filter: "",
      title,
      description,
      generatedBy: "HR Admin",
      data,
    };

    setLoading(true);
    try {
      if (editingReport) {
        await deleteReport(editingReport._id || editingReport.id);
      }
      await createReport(payload);
      setSnackbar({
        open: true,
        message: editingReport ? "Report updated successfully!" : "Report saved successfully!",
        severity: "success"
      });
      setTitle("");
      setDescription("");
      setReportType("");
      setData([]);
      setShowForm(false);
      setEditingReport(null);
      fetchReportsData();
    } catch (error) {
      console.error("Error updating report:", error);
      setSnackbar({
        open: true,
        message: "Error updating report. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  const [reportsData, setReportsData] = useState([]); 
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredReports, setFilteredReports] = useState(reportsData); // Assuming reportsData is the full unfiltered data

   useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await fetch("/reports/getReports"); 
        const data = await response.json();
        setReportsData(data);
        setFilteredReports(data); 
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);
    const handleDateFilter = (filter) => {
    setSelectedFilter(filter);
    let filteredData;
    const today = new Date();
    switch (filter) {
      case "Today":
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));
        filteredData = reportsData.filter((report) => {
          const reportDate = new Date(report.date);
          return reportDate >= todayStart && reportDate <= todayEnd;
        });
        break;
      case "Yesterday":
        const yesterday = new Date(today.setDate(today.getDate() - 1));
        const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
        const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));
        filteredData = reportsData.filter((report) => {
          const reportDate = new Date(report.date);
          return reportDate >= yesterdayStart && reportDate <= yesterdayEnd;
        });
        break;
      case "Last 7 Days":
        const last7Days = new Date(today.setDate(today.getDate() - 7));
        filteredData = reportsData.filter((report) => {
          const reportDate = new Date(report.date);
          return reportDate >= last7Days && reportDate <= today;
        });
        break;
      case "This Month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filteredData = reportsData.filter((report) => {
          const reportDate = new Date(report.date);
          return reportDate >= startOfMonth && reportDate <= endOfMonth;
        });
        break;
      default:
        filteredData = reportsData; // "All" option, no filter applied
    }

    // Check if no reports match the filter
    if (filteredData.length === 0) {
      setFilteredReports([]);
    } else {
      setFilteredReports(filteredData);
    }
  };

  // Handle custom date range filter (from start date to end date)
  const applyDateRange = () => {
    if (startDate && endDate) {
      const filteredData = reportsData.filter((report) => {
        const reportDate = new Date(report.date);
        const reportStartDate = new Date(startDate);
        const reportEndDate = new Date(endDate);
        return reportDate >= reportStartDate && reportDate <= reportEndDate;
      });

      // Check if no reports match the custom date range
      if (filteredData.length === 0) {
        setFilteredReports([]);
      } else {
        setFilteredReports(filteredData);
      }
    }
  };


  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };
const getStatusBackgroundColor = (status) => {
  switch (status) {
    case 'Unpaid':
    case 'Rejected':
    case 'Pending':
      return 'rgba(255, 0, 0, 0.1)'; // Light red
    case 'Paid':
    case 'Hired':
    case 'Completed':
      return 'rgba(0, 255, 0, 0.1)'; // Light green
    case 'In Progress':
    case 'Shortlisted':
      return 'rgba(255, 255, 0, 0.1)'; // Light yellow
    case 'Resigned':
      return 'rgba(255, 165, 0, 0.1)'; // Light orange
    case 'On Leave':
      return 'rgba(173, 216, 230, 0.3)'; // Light blue
    case 'Terminated':
      return 'rgba(128, 0, 0, 0.1)'; // Dark red
    case 'Absent':
      return 'rgba(255, 228, 196, 0.3)'; // Light beige
    default:
      return ''; 
  }
};

  const renderTable = (tableData, reportType) => {
    const { headers, rows, config } = cleanDataForDisplay(tableData, reportType);
    
    if (!rows || rows.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      );
    }
    return (
      <Box sx={{ 
        overflowX: "auto", 
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          fontSize: "0.875rem"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
              <th style={{ 
                border: "1px solid #1565c0", 
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: "0.9rem",
                minWidth: "50px"
              }}>
                #
              </th>
              {headers.map((header) => (
                <th 
                  key={header.key} 
                  style={{ 
                    border: "1px solid #1565c0", 
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    minWidth: "120px"
                  }}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
        <tbody>
  {rows.map((item, idx) => {
    return (
      <tr
        key={idx}
        style={{
          backgroundColor: idx % 2 === 0 ? "#fff" : "#f8f9fa", // Alternating row colors
          transition: "background-color 0.2s ease", // Smooth row hover transition
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f2fd")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f8f9fa")
        }
      >
        <td
          style={{
            border: "1px solid #e0e0e0",
            padding: "12px 16px",
            color: "#424242",
            fontWeight: 500,
          }}
        >
          {idx + 1}
        </td>
        {headers.map((header, i) => (
          <td
            key={i}
            style={{
              border: "1px solid #e0e0e0",
              padding: "12px 16px",
              color: "#616161",
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={formatValue(item[header.key], header.type, header.key)}
          >
            {header.key === "status" ? ( // Check if this column is "status"
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  backgroundColor:
                    item.status === "Paid"
                      ? "rgba(0, 128, 0, 0.15)" // Light green for Paid
                      : item.status === "Unpaid"
                      ? "rgba(255, 0, 0, 0.15)" // Light red for Unpaid
                      : item.status === "Pending"
                      ? "rgba(255, 255, 0, 0.15)" // Light yellow for Pending
                      : item.status === "Hired"
                      ? "rgba(0, 255, 0, 0.1)" // Green for Hired
                      : item.status === "Rejected"
                      ? "rgba(255, 0, 0, 0.1)" // Red for Rejected
                      : item.status === "Resigned"
                      ? "rgba(255, 165, 0, 0.1)" // Light orange for Resigned
                      : item.status === "On Leave"
                      ? "rgba(173, 216, 230, 0.3)" // Light blue for On Leave
                      : item.status === "Terminated"
                      ? "rgba(128, 0, 0, 0.1)" // Dark red for Terminated
                      : item.status === "Absent"
                      ? "rgba(255, 228, 196, 0.3)" // Light beige for Absent
                      : "#f0f0f0", // Default if no matching status
                  color:
                    item.status === "Paid"
                      ? "green" // Dark green text for Paid
                      : ["Unpaid", "Rejected", "Terminated"].includes(item.status)
                      ? "darkred" // Dark red text for Unpaid, Rejected, and Terminated
                      : "black", // Default text color
                  textAlign: "center",
                  minWidth: "70px",
                }}
              >
                {item.status}
              </span>
            ) : (
              formatValue(item[header.key], header.type, header.key) // For other columns, display normally
            )}
          </td>
        ))}
      </tr>
    );
  })}
</tbody>

        </table>
      </Box>
    );
  };

  if (dataLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: "0 auto", p: 4 }}>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report <strong>"{deleteDialog.reportTitle}"</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Viewing Report Modal */}
      {viewingReport && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 1200,
            maxHeight: "90vh",
            overflow: "auto",
            zIndex: 1300,
            p: 4
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {viewingReport.title}
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <Chip 
                  label={viewingReport.reportType} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={viewingReport.generatedBy} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={`${viewingReport.data?.length || 0} records`} 
                  size="small" 
                  color="success"
                  variant="outlined"
                />
              </Box>
              {viewingReport.description && (
                <Typography variant="body2" color="text.secondary">
                  {viewingReport.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Generated on {new Date(viewingReport.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {new Date(viewingReport.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleCloseReport}
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {renderTable(viewingReport.data, viewingReport.reportType)}
        </Paper>
      )}

      {/* Backdrop overlay */}
      {viewingReport && (
        <Box
          onClick={handleCloseReport}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1200
          }}
        />
      )}

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Generate Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a report type and generate detailed reports for your records
        </Typography>
      </Box>

      {/* Report Type Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" gap={2} alignItems="flex-end">
          <TextField
            select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            sx={{ flex: 1 }}
            variant="outlined"
          >
            {reportTypes.map((type, idx) => (
              <MenuItem key={idx} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerate} 
            disabled={!reportType}
            sx={{ 
              px: 4, 
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem"
            }}
          >
            Generate Report
          </Button>
        </Box>
      </Paper>

      {/* Form and Preview */}
      {showForm && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Report Details
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField
              label="Report Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="Enter report title"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Optional description"
              multiline
              rows={4}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button 
              variant="contained" 
              color="success" 
              onClick={editingReport ? handleUpdateReport : handleSubmit}
              disabled={loading || !title}
              sx={{ 
                px: 4, 
                py: 1.2,
                textTransform: "none",
                fontSize: "1rem"
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : editingReport ? "Update Report" : "Save Report"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Report Preview */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Preview
            </Typography>
            <Chip 
              label={`${data.length} records`} 
              color="primary" 
              size="small" 
            />
          </Box>
          
          {renderTable(data, reportType)}
        </Paper>
      )}

      {/* Saved Reports */}
      <Box>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Saved Reports
        </Typography>
        
        {savedReports.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No saved reports yet. Generate your first report above.
            </Typography>
          </Paper>
        ) : (
          <Box display="grid" gap={2}>
            {savedReports.map((r, idx) => (
              <Card 
                key={idx} 
                elevation={2}
                sx={{ 
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    elevation: 4,
                    transform: "translateY(-2px)",
                    boxShadow: 3
                  }
                }}
                onClick={() => handleViewReport(r)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {r.title}
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        <Chip 
                          label={r.reportType} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={r.generatedBy} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Generated on {new Date(r.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {new Date(r.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        onClick={(e) => handleViewReport(r)}
                        sx={{
                          color: "primary.main",
                          border: "2px solid",
                          borderColor: "primary.main",
                          padding: "8px",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white"
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleEditReport(e, r)}
                        sx={{
                          color: "warning.main",
                          border: "2px solid",
                          borderColor: "warning.main",
                          padding: "8px",
                          "&:hover": {
                            backgroundColor: "warning.main",
                            color: "white"
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleDeleteClick(e, r)}
                        sx={{
                          color: "error.main",
                          border: "2px solid",
                          borderColor: "error.main",
                          padding: "8px",
                          "&:hover": {
                            backgroundColor: "error.main",
                            color: "white"
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Snackbar for Messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: "100%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "15px",
            fontWeight: 500
          }}
          icon={snackbar.severity === "success" ? <CheckCircleIcon fontSize="inherit" /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;