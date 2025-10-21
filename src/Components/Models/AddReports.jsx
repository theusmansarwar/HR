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
} from "@mui/material";
import { CSVLink } from "react-csv";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
  overflowY: "auto",
};

const reportTypes = ["Employees", "Payroll", "Performance", "Fines", "Applications"];

// Dynamic filters based on report type
const filtersByReportType = {
  Employees: ["All", "Active", "Inactive"],
  Payroll: ["All", "Yes", "No"], // archive
  Performance: ["All", ">=80", "<80"], // score
  Fines: ["All", "Paid", "Unpaid"], // status
  Applications: ["All", "Pending", "Shortlisted", "Hired", "Rejected"], // applicationStatus
};

export default function AddReports({ open, setOpen, datasets }) {
  const [reportType, setReportType] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([]);
    setFilterValue("All");
  }, [reportType]);

  const handleClose = () => setOpen(false);

  const handleGenerate = () => {
    let selectedData = datasets[reportType] || [];

    if (filterValue && filterValue !== "All") {
      selectedData = selectedData.filter((item) => {
        switch (reportType) {
          case "Employees":
            return item.status === filterValue;
          case "Payroll":
            return item.archive === filterValue;
          case "Performance":
            return filterValue === ">=80" ? item.score >= 80 : item.score < 80;
          case "Fines":
            return item.status === filterValue;
          case "Applications":
            return item.applicationStatus === filterValue;
          default:
            return true;
        }
      });
    }

    setData(selectedData);
  };

  // Columns based on first object
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Generate {reportType || "Report"}
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Report Type"
              fullWidth
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((type, idx) => (
                <MenuItem key={idx} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {reportType && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Filter"
                fullWidth
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {filtersByReportType[reportType].map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {reportType && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </Grid>
          )}
        </Grid>

        {data.length > 0 && (
          <>
            <CSVLink
              data={data}
              filename={`${reportType}_report.csv`}
              style={{ textDecoration: "none" }}
            >
              <Button variant="contained" color="success" sx={{ mb: 2 }}>
                Download CSV
              </Button>
            </CSVLink>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell key={col}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map((col) => (
                        <TableCell key={col}>{row[col]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Modal>
  );
}
