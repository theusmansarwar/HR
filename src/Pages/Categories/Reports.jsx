import React, { useState, useEffect } from "react";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { CSVLink } from "react-csv";
import axios from "axios";

const reportTypes = ["Employees", "Payroll", "Performance", "Fines", "Applications"];

const Reports = ({ employees = [], payrolls = [], performance = [], fines = [], applications = [] }) => {
  const [reportType, setReportType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const res = await axios.get("/api/reports");
    setSavedReports(res.data);
  };

  const handleGenerate = () => {
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

    if (statusFilter) {
      selectedData = selectedData.filter((item) => item.status === statusFilter);
    }

    setData(selectedData);
  };

  const handleSubmit = async () => {
    if (!title || !reportType) return alert("Please fill all required fields");

    const payload = {
      reportType,
      filter: statusFilter,
      title,
      description,
      generatedBy: "HR Admin",
      data,
    };

    await axios.post("/api/reports", payload);
    alert("Report saved successfully!");
    setTitle("");
    setDescription("");
    fetchReports();
  };

  return (
    <Box p={4}>
      <Typography variant="h5" mb={2}>
        Generate Reports
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          select
          label="Select Report Type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          fullWidth
        >
          {reportTypes.map((type, idx) => (
            <MenuItem key={idx} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status Filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Unpaid">Unpaid</MenuItem>
        </TextField>

        <Button variant="contained" color="primary" onClick={handleGenerate} disabled={!reportType}>
          Generate
        </Button>
      </Box>

      {data.length > 0 && (
        <>
          <Typography variant="h6">Add Report Details</Typography>
          <Box display="flex" gap={2} mt={2} mb={2}>
            <TextField label="Report Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>

          <Typography variant="h6">Report Preview:</Typography>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx}>
                    {Object.values(item).map((val, i) => (
                      <td key={i} style={{ border: "1px solid #ccc", padding: "8px" }}>
                        {val?.toString() ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </>
      )}

      {/* Saved Reports List */}
      <Box mt={5}>
        <Typography variant="h6">Saved Reports</Typography>
        {savedReports.map((r, idx) => (
          <Box key={idx} p={2} border="1px solid #ddd" borderRadius="8px" mb={2}>
            <Typography><b>Title:</b> {r.title}</Typography>
            <Typography><b>Type:</b> {r.reportType}</Typography>
            <Typography><b>Generated By:</b> {r.generatedBy}</Typography>
            <Typography><b>Date:</b> {new Date(r.createdAt).toLocaleString()}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Reports;
