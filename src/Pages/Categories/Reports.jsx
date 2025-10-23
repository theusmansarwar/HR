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
  Chip
} from "@mui/material";
import { fetchReports } from "../../DAL/fetch";
import { createReport } from "../../DAL/create";
import { 
  fetchEmployees, 
  fetchPayrolls, 
  fetchPerformance, 
  fetchFines, 
  fetchApplications 
} from "../../DAL/fetch";

const reportTypes = ["Employees", "Payroll", "Performance", "Fines", "Applications"];

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
      alert("Error loading data. Please refresh the page.");
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
      alert("Please select a report type");
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
      alert("Please fill all required fields");
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
      alert("Report saved successfully!");
      setTitle("");
      setDescription("");
      setReportType("");
      setData([]);
      setShowForm(false);
      fetchReportsData();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error saving report. Please try again.");
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
                Generated on {new Date(viewingReport.createdAt).toLocaleDateString()} at {new Date(viewingReport.createdAt).toLocaleTimeString()}
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

          {viewingReport.data && viewingReport.data.length > 0 ? (
            <Box sx={{ 
              overflowX: "auto", 
              border: "1px solid #e0e0e0",
              borderRadius: 1
            }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: "0.875rem"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    {Object.keys(viewingReport.data[0]).map((key) => (
                      <th 
                        key={key} 
                        style={{ 
                          border: "1px solid #e0e0e0", 
                          padding: "12px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#424242"
                        }}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewingReport.data.map((item, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa"
                      }}
                    >
                      {Object.values(item).map((val, i) => (
                        <td 
                          key={i} 
                          style={{ 
                            border: "1px solid #e0e0e0", 
                            padding: "12px 16px",
                            color: "#616161"
                          }}
                        >
                          {val?.toString() ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No data available in this report
              </Typography>
            </Box>
          )}
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
          
          <Box display="flex" gap={2} mb={3}>
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
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSubmit}
              disabled={loading || !title}
              sx={{ 
                px: 4, 
                py: 1.2,
                textTransform: "none",
                fontSize: "1rem"
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Report"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Report Preview */}
          {data.length > 0 ? (
            <>
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
              
              <Box sx={{ 
                overflowX: "auto", 
                border: "1px solid #e0e0e0",
                borderRadius: 1
              }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  fontSize: "0.875rem"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      {Object.keys(data[0]).map((key) => (
                        <th 
                          key={key} 
                          style={{ 
                            border: "1px solid #e0e0e0", 
                            padding: "12px 16px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#424242"
                          }}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr 
                        key={idx}
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa"
                        }}
                      >
                        {Object.values(item).map((val, i) => (
                          <td 
                            key={i} 
                            style={{ 
                              border: "1px solid #e0e0e0", 
                              padding: "12px 16px",
                              color: "#616161"
                            }}
                          >
                            {val?.toString() ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </>
          ) : (
            <Box 
              sx={{ 
                textAlign: "center", 
                py: 4,
                color: "text.secondary"
              }}
            >
              <Typography variant="body1">
                No data available for the selected report type
              </Typography>
            </Box>
          )}
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
                        Generated on {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ fontWeight: 500 }}
                    >
                      View →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Reports;