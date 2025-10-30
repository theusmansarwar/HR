// src/Components/Models/AddReports.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Fade,
  LinearProgress,
  Divider,
  ButtonGroup,
  TablePagination,
  alpha,
} from "@mui/material";
import { CSVLink } from "react-csv";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  fetchApplications,
  fetchEmployees,
  fetchDepartments,
  fetchDesignations,
  fetchJobs,
  fetchPayrolls,
  fetchPerformance,
  fetchFines,
  fetchTraining,
  fetchAttendance,
  fetchLeaves,
} from "../../DAL/fetch";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "96%",
  maxWidth: "1600px",
  maxHeight: "96vh",
  bgcolor: "background.paper",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  borderRadius: "16px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const reportTypes = [
  { value: "Employees", label: "👥 Employees", icon: "👥" },
  { value: "Departments", label: "🏢 Departments", icon: "🏢" },
  { value: "Designations", label: "💼 Designations", icon: "💼" },
  { value: "Jobs", label: "📋 Jobs", icon: "📋" },
  { value: "Payroll", label: "💰 Payroll", icon: "💰" },
  { value: "Performance", label: "📈 Performance", icon: "📈" },
  { value: "Fines", label: "⚠️ Fines", icon: "⚠️" },
  { value: "Training", label: "📚 Training", icon: "📚" },
  { value: "Applications", label: "📝 Applications", icon: "📝" },
  { value: "Attendance", label: "✅ Attendance", icon: "✅" },
  { value: "Leaves", label: "🏖️ Leaves", icon: "🏖️" },
];

const filtersByReportType = {
  Employees: ["All", "Active", "Inactive", "Terminated"],
  Departments: ["All", "Active", "Inactive"],
  Designations: ["All", "Active", "Inactive"],
  Jobs: ["All", "Open", "Closed", "On Hold"],
  Payroll: ["All", "Paid", "Unpaid", "Pending", "Processing"],
  Performance: ["All", "Excellent (>=90)", "Good (>=80)", "Average (>=70)", "Below Average (<70)"],
  Fines: ["All", "Paid", "Unpaid", "Waived"],
  Training: ["All", "Completed", "In Progress", "Upcoming", "Cancelled"],
  Applications: ["All", "Pending", "Shortlisted", "Interviewed", "Hired", "Rejected"],
  Attendance: ["All", "Present", "Absent", "Late", "Half Day", "On Leave"],
  Leaves: ["All", "Approved", "Pending", "Rejected", "Cancelled"],
};

const fetchFunctionMap = {
  Employees: fetchEmployees,
  Departments: fetchDepartments,
  Designations: fetchDesignations,
  Jobs: fetchJobs,
  Payroll: fetchPayrolls,
  Performance: fetchPerformance,
  Fines: fetchFines,
  Training: fetchTraining,
  Applications: fetchApplications,
  Attendance: fetchAttendance,
  Leaves: fetchLeaves,
};

const getStatusColor = (status) => {
  const statusMap = {
    Active: "success",
    Inactive: "default",
    Terminated: "error",
    Completed: "success",
    Pending: "warning",
    Paid: "success",
    Unpaid: "error",
    Approved: "success",
    Rejected: "error",
    Present: "success",
    Absent: "error",
    Late: "warning",
    Hired: "success",
    Shortlisted: "info",
    Interviewed: "secondary",
    "In Progress": "info",
    Processing: "info",
    Upcoming: "default",
    Waived: "default",
    Open: "success",
    Closed: "default",
    "On Hold": "warning",
    "Half Day": "warning",
    "On Leave": "info",
    Cancelled: "default",
  };
  return statusMap[status] || "default";
};

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  
  if (
    key.toLowerCase().includes("date") ||
    key === "createdAt" ||
    key === "updatedAt"
  ) {
    try {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  }
  
  if (
    key.toLowerCase().includes("salary") ||
    key.toLowerCase().includes("amount") ||
    key.toLowerCase().includes("payment") ||
    key.toLowerCase().includes("fine")
  ) {
    const num = parseFloat(value);
    return isNaN(num) ? value : `$${num.toLocaleString()}`;
  }
  
  if (key.toLowerCase().includes("score") || key.toLowerCase().includes("rating")) {
    return `${value}%`;
  }
  
  return value;
};

const cleanColumnName = (col) => {
  return col
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
};

export default function AddReports({ open, setOpen }) {
  const [reportType, setReportType] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setData([]);
    setFilteredData([]);
    setFilterValue("All");
    setSearchQuery("");
    setDateRange({ from: "", to: "" });
    setSummary(null);
    setError(null);
    setPage(0);
  }, [reportType]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = data.filter((item) =>
      Object.entries(item).some(([key, val]) => {
        if (key === "_id" || key === "__v") return false;
        return String(val).toLowerCase().includes(query);
      })
    );
    setFilteredData(filtered);
    setPage(0);
  }, [searchQuery, data]);

  const handleClose = () => {
    setOpen(false);
    setReportType("");
    setData([]);
    setFilteredData([]);
    setError(null);
  };

  const fetchReportData = async () => {
    if (!reportType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchFunction = fetchFunctionMap[reportType];
      
      if (!fetchFunction) {
        throw new Error(`No fetch function defined for ${reportType}`);
      }

      const response = await fetchFunction();
      
      if (!response || !Array.isArray(response)) {
        throw new Error("Invalid response format from server");
      }

      // Clean data by removing MongoDB specific fields
      const cleanedData = response.map(item => {
        const { _id, __v, ...rest } = item;
        return rest;
      });
      
      setData(cleanedData);
      setFilteredData(cleanedData);
      calculateSummary(cleanedData);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Failed to fetch report data. Please try again.");
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (reportData) => {
    if (!reportData.length) {
      setSummary(null);
      return;
    }

    const stats = {
      total: reportData.length,
    };

    // Count status occurrences
    const statusField = reportData[0].status ? 'status' : 
                       reportData[0].applicationStatus ? 'applicationStatus' : null;
    
    if (statusField) {
      const statusCounts = {};
      reportData.forEach(item => {
        const status = item[statusField];
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });
      stats.statusBreakdown = statusCounts;
      
      // Common status metrics
      stats.active = statusCounts.Active || 0;
      stats.inactive = statusCounts.Inactive || 0;
      stats.pending = statusCounts.Pending || 0;
    }

    // Payroll specific
    if (reportType === "Payroll") {
      const salaryField = Object.keys(reportData[0]).find(k => 
        k.toLowerCase().includes('salary') || k.toLowerCase().includes('amount')
      );
      
      if (salaryField) {
        stats.totalAmount = reportData.reduce(
          (sum, item) => sum + (parseFloat(item[salaryField]) || 0), 0
        );
        stats.averageAmount = stats.totalAmount / reportData.length;
      }
      stats.paid = reportData.filter(i => i.status === "Paid").length;
      stats.unpaid = reportData.filter(i => i.status === "Unpaid").length;
    }

    // Performance specific
    if (reportType === "Performance") {
      const scoreField = Object.keys(reportData[0]).find(k => 
        k.toLowerCase().includes('score') || k.toLowerCase().includes('rating')
      );
      
      if (scoreField) {
        const scores = reportData.map(i => parseFloat(i[scoreField]) || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        stats.averageScore = avgScore.toFixed(2);
        stats.highPerformers = scores.filter(s => s >= 90).length;
        stats.lowPerformers = scores.filter(s => s < 70).length;
      }
    }

    // Attendance specific
    if (reportType === "Attendance") {
      stats.present = reportData.filter(i => i.status === "Present").length;
      stats.absent = reportData.filter(i => i.status === "Absent").length;
      stats.late = reportData.filter(i => i.status === "Late").length;
      
      if (stats.total > 0) {
        stats.attendanceRate = ((stats.present / stats.total) * 100).toFixed(1);
      }
    }

    // Leaves specific
    if (reportType === "Leaves") {
      stats.approved = reportData.filter(i => i.status === "Approved").length;
      stats.rejected = reportData.filter(i => i.status === "Rejected").length;
      
      if (stats.total > 0) {
        stats.approvalRate = ((stats.approved / stats.total) * 100).toFixed(1);
      }
    }

    setSummary(stats);
  };

  const handleGenerate = async () => {
    await fetchReportData();
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filterValue && filterValue !== "All") {
      filtered = filtered.filter((item) => {
        if (reportType === "Performance") {
          const scoreField = Object.keys(item).find(k => 
            k.toLowerCase().includes('score') || k.toLowerCase().includes('rating')
          );
          const score = parseFloat(item[scoreField]) || 0;
          
          if (filterValue.includes(">=90")) return score >= 90;
          if (filterValue.includes(">=80")) return score >= 80;
          if (filterValue.includes(">=70")) return score >= 70;
          if (filterValue.includes("<70")) return score < 70;
        }
        
        return item.status === filterValue || item.applicationStatus === filterValue;
      });
    }

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((item) => {
        const dateField = Object.keys(item).find(k => 
          k.toLowerCase().includes('date') || k === 'createdAt'
        );
        
        if (!dateField || !item[dateField]) return true;
        
        try {
          const itemDate = new Date(item[dateField]);
          return (
            itemDate >= new Date(dateRange.from) &&
            itemDate <= new Date(dateRange.to)
          );
        } catch {
          return true;
        }
      });
    }

    setFilteredData(filtered);
    calculateSummary(filtered);
    setPage(0);
  };

  useEffect(() => {
    if (data.length > 0) {
      applyFilters();
    }
  }, [filterValue, dateRange]);

  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text(`${reportType} Report`, 14, 20);
    
    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Records: ${filteredData.length}`, 14, 34);
    doc.text(`Filter: ${filterValue}`, 14, 40);

    // Summary section
    if (summary) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Summary Statistics", 14, 50);
      doc.setFontSize(9);
      
      let yPos = 56;
      Object.entries(summary).forEach(([key, value]) => {
        if (typeof value === 'object') return;
        doc.text(`${cleanColumnName(key)}: ${value}`, 14, yPos);
        yPos += 5;
      });
    }

    const columns = filteredData.length > 0 ? 
      Object.keys(filteredData[0]).filter(k => k !== '_id' && k !== '__v') : [];
    
    const rows = filteredData.map((row) =>
      columns.map((col) => String(formatValue(col, row[col])))
    );

    doc.autoTable({
      head: [columns.map(cleanColumnName)],
      body: rows,
      startY: summary ? 75 : 50,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [33, 150, 243],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10 },
    });

    doc.save(`${reportType}_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const columns = filteredData.length > 0 ? 
    Object.keys(filteredData[0]).filter(k => k !== '_id' && k !== '__v') : [];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="700">
                Advanced Report Generator
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Generate comprehensive reports with advanced analytics
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          {/* Filters */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FilterListIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="600">
                  Report Configuration
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Select Report Type"
                    fullWidth
                    size="small"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    SelectProps={{
                      renderValue: (selected) => {
                        const report = reportTypes.find(r => r.value === selected);
                        return report ? report.label : "";
                      }
                    }}
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {reportType && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        select
                        label="Filter By Status"
                        fullWidth
                        size="small"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                      >
                        {filtersByReportType[reportType]?.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        type="date"
                        label="From Date"
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={dateRange.from}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, from: e.target.value })
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        type="date"
                        label="To Date"
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={dateRange.to}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, to: e.target.value })
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={12} md={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleGenerate}
                        disabled={loading}
                        sx={{ 
                          height: "40px",
                          background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        }}
                        startIcon={loading ? null : <TrendingUpIcon />}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Generate"}
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Summary Cards */}
          {summary && !loading && (
            <Fade in={!!summary}>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white"
                  }}>
                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Records
                      </Typography>
                      <Typography variant="h4" fontWeight="700">
                        {summary.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {summary.active !== undefined && (
                  <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ 
                      background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                      color: "white"
                    }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Active
                        </Typography>
                        <Typography variant="h4" fontWeight="700">
                          {summary.active}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {summary.totalAmount !== undefined && (
                  <Grid item xs={6} sm={4} md={2.5}>
                    <Card sx={{ 
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white"
                    }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Amount
                        </Typography>
                        <Typography variant="h5" fontWeight="700">
                          ${summary.totalAmount.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {summary.averageScore !== undefined && (
                  <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ 
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "white"
                    }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Avg Score
                        </Typography>
                        <Typography variant="h4" fontWeight="700">
                          {summary.averageScore}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {summary.attendanceRate !== undefined && (
                  <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ 
                      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                      color: "white"
                    }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Attendance Rate
                        </Typography>
                        <Typography variant="h4" fontWeight="700">
                          {summary.attendanceRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Fade>
          )}

          {/* Search & Export */}
          {filteredData.length > 0 && !loading && (
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Search across all fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, minWidth: "250px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <ButtonGroup variant="outlined">
                <CSVLink
                  data={filteredData}
                  filename={`${reportType}_Report_${new Date().toISOString().split("T")[0]}.csv`}
                  style={{ textDecoration: "none" }}
                >
                  <Button startIcon={<DownloadIcon />} sx={{ height: "40px" }}>
                    Export CSV
                  </Button>
                </CSVLink>

                <Button
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={exportToPDF}
                  sx={{ height: "40px" }}
                >
                  Export PDF
                </Button>
                
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={handleGenerate}
                  sx={{ height: "40px" }}
                >
                  Refresh
                </Button>
              </ButtonGroup>
            </Box>
          )}

          {/* Loading State */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                gap: 3,
              }}
            >
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Fetching {reportType} data from server...
              </Typography>
              <LinearProgress sx={{ width: "300px" }} />
            </Box>
          )}

          {/* Empty State */}
          {!loading && reportType && filteredData.length === 0 && data.length > 0 && (
            <Card sx={{ textAlign: "center", py: 8, background: alpha("#667eea", 0.05) }}>
              <Typography variant="h5" color="text.secondary" mb={2} fontWeight="600">
                📭 No Results Found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Try adjusting your filters or search criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setFilterValue("All");
                  setSearchQuery("");
                  setDateRange({ from: "", to: "" });
                }}
              >
                Clear All Filters
              </Button>
            </Card>
          )}

          {/* Data Table */}
          {!loading && filteredData.length > 0 && (
            <>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 500,
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontWeight: "700",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            textTransform: "capitalize",
                            fontSize: "0.875rem",
                          }}
                        >
                          {cleanColumnName(col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row, idx) => (
                      <TableRow 
                        key={idx} 
                        hover
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: alpha("#667eea", 0.02),
                          },
                        }}
                      >
                        {columns.map((col) => (
                          <TableCell key={col}>
                            {col === "status" || col === "applicationStatus" ? (
                              <Chip
                                label={row[col]}
                                color={getStatusColor(row[col])}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              <Typography variant="body2">
                                {formatValue(col, row[col])}
                              </Typography>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                sx={{ 
                  borderTop: "1px solid #e0e0e0",
                  mt: 2,
                }}
              />

              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                flexWrap: "wrap",
                gap: 2,
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} records
                  {data.length !== filteredData.length && ` (filtered from ${data.length} total)`}
                </Typography>
                
                {summary && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {Object.entries(summary.statusBreakdown || {}).map(([status, count]) => (
                      <Chip
                        key={status}
                        label={`${status}: ${count}`}
                        size="small"
                        color={getStatusColor(status)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Initial State */}
          {!loading && !reportType && (
            <Card sx={{ 
              textAlign: "center", 
              py: 10,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            }}>
              <AssessmentIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" fontWeight="600" mb={2}>
                Welcome to Report Generator
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Select a report type above to get started with comprehensive data analysis
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", px: 4 }}>
                {reportTypes.slice(0, 6).map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => setReportType(type.value)}
                    sx={{ 
                      fontSize: "0.9rem",
                      py: 2.5,
                      px: 1,
                      cursor: "pointer",
                      "&:hover": {
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                      }
                    }}
                  />
                ))}
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Modal>
  );
}