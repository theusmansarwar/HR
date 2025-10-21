// src/Pages/Reports.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { CSVLink } from "react-csv";

const reportTypes = ["Employees", "Payroll", "Performance", "Fines", "Applications"];

const Reports = ({
  employees = [],
  payrolls = [],
  performance = [],
  fines = [],
  applications = [],
}) => {
  const [reportType, setReportType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState([]);

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
      selectedData = selectedData.filter(
        (item) => item.status === statusFilter
      );
    }

    setData(selectedData);
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerate}
          disabled={!reportType}
        >
          Generate
        </Button>

        {data.length > 0 && (
          <CSVLink
            data={data}
            filename={`${reportType}_report.csv`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="success">
              Download CSV
            </Button>
          </CSVLink>
        )}
      </Box>

      {data.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Report Preview:</Typography>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        background: "#f5f5f5",
                      }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx}>
                    {Object.values(item).map((val, i) => (
                      <td
                        key={i}
                        style={{ border: "1px solid #ccc", padding: "8px" }}
                      >
                        {val?.toString() ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
