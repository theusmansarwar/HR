import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestoreIcon from "@mui/icons-material/Restore";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ArchiveManagement = () => {
  const navigate = useNavigate();
  const [archives, setArchives] = useState({});
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [selectedTable, setSelectedTable] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customDateFilter, setCustomDateFilter] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog state
  const [restoreDialog, setRestoreDialog] = useState({
    open: false,
    type: "", // 'single', 'table', 'all'
    data: null,
  });

  // Get auth token
  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch archives
  const fetchArchives = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:5009/archives/all",
        getAuthConfig()
      );
      
      if (data.status === 400) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      setArchives(data.archives || {});
      applyFilters(data.archives || {}, selectedTable, searchQuery, customDateFilter);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to fetch archives",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5009/archives/stats",
        getAuthConfig()
      );
      setStats(data.stats || []);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchArchives();
    fetchStats();
  }, []);

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Apply filters
  const applyFilters = (archivesData, table, search, useCustomDate = false) => {
    let allRecords = [];

    // Get records from selected table or all tables
    if (table === "all") {
      Object.entries(archivesData).forEach(([tableName, tableData]) => {
        tableData.data.forEach((record) => {
          allRecords.push({ ...record, _tableName: tableName });
        });
      });
    } else if (archivesData[table]) {
      archivesData[table].data.forEach((record) => {
        allRecords.push({ ...record, _tableName: table });
      });
    }

    // Apply date filter
    if (useCustomDate && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      allRecords = allRecords.filter((record) => {
        const recordDate = new Date(record.createdAt || record.updatedAt);
        return recordDate >= start && recordDate <= end;
      });
    }

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();
      allRecords = allRecords.filter((record) => {
        return Object.entries(record).some(([key, value]) => {
          if (["_id", "__v", "archive", "password", "_tableName"].includes(key)) {
            return false;
          }
          const strValue = String(value).toLowerCase();
          return strValue.includes(searchLower);
        });
      });
    }

    setFilteredData(allRecords);
  };

  // Handle restore operations
  const handleRestore = async () => {
    const { type, data } = restoreDialog;

    try {
      setRestoring(true);
      let response;

      if (type === "single") {
        response = await axios.post(
          `http://localhost:5009/archives/restore/${data._tableName}/${data._id}`,
          {},
          getAuthConfig()
        );
      } else if (type === "table") {
        response = await axios.post(
          `http://localhost:5009/archives/restore-table/${data}`,
          {},
          getAuthConfig()
        );
      } else if (type === "all") {
        response = await axios.post(
          "http://localhost:5009/archives/restore-all",
          {},
          getAuthConfig()
        );
      }

      showSnackbar(response.data.message, "success");
      setRestoreDialog({ open: false, type: "", data: null });
      
      // Refresh data
      await fetchArchives();
      await fetchStats();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to restore",
        "error"
      );
    } finally {
      setRestoring(false);
    }
  };

  // Handle table change
  const handleTableChange = (event, newValue) => {
    setSelectedTable(newValue);
    setPage(0);
    setCustomDateFilter(false);
    setStartDate("");
    setEndDate("");
    applyFilters(archives, newValue, searchQuery, false);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(0);
    applyFilters(archives, selectedTable, value, customDateFilter);
  };

  // Handle date filter
  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      setCustomDateFilter(true);
      setPage(0);
      applyFilters(archives, selectedTable, searchQuery, true);
    }
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCustomDateFilter(false);
    applyFilters(archives, selectedTable, searchQuery, false);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate totals
  const totalRecords = Object.values(archives).reduce(
    (sum, table) => sum + table.count,
    0
  );
  const totalTables = Object.keys(archives).length;
  const totalActive = stats.reduce((sum, s) => sum + s.active, 0);

  // Get display records for current page
  const displayRecords = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get table names for tabs
  const tableNames = ["all", ...Object.keys(archives)];

  return (
    <Box
      sx={{
        width: "95%",
        height: "95vh",
        p: { xs: 1, sm: 2, md: 3 },
        overflow: "hidden",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          height: "100%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ArchiveIcon
              sx={{
                fontSize: "2rem",
                color: "var(--primary-color)",
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "var(--primary-color)",
                fontWeight: 600,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Archive Management
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search archives..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            autoComplete="off"
            sx={{
              width: { xs: "100%", sm: "300px", md: "350px" },
              backgroundColor: "white",
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "var(--primary-color)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary-color)",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "#9e9e9e" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flexShrink: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #081b6eff 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <InfoIcon sx={{ fontSize: "2.5rem", opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {totalTables}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tables with Archives
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #680773ff 0%, #85434bff 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <DeleteSweepIcon sx={{ fontSize: "2.5rem", opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {totalRecords}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Archived Records
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #114878ff 0%, #299399ff 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: "2.5rem", opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {totalActive}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Records
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs and Date Filter */}
        <Box
          sx={{
            borderBottom: "1px solid #e0e0e0",
            px: { xs: 1, sm: 2, md: 3 },
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              py: 1,
            }}
          >
            <Tabs
              value={selectedTable}
              onChange={handleTableChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: { xs: "13px", sm: "14px" },
                  minWidth: { xs: "auto", sm: "auto" },
                  px: { xs: 2, sm: 3 },
                  py: 1.5,
                },
                "& .Mui-selected": {
                  color: "var(--primary-color, #0c3e70ff) !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "var(--primary-color, #0a3a69ff)",
                },
              }}
            >
              {tableNames.map((table) => (
                <Tab
                  key={table}
                  label={table === "all" ? "All Tables" : table}
                  value={table}
                />
              ))}
            </Tabs>

            {/* Date Range Picker */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <TextField
                type="date"
                size="small"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: { xs: "140px", sm: "160px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <TextField
                type="date"
                size="small"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate }}
                sx={{
                  minWidth: { xs: "140px", sm: "160px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleApplyDateFilter}
                disabled={!startDate || !endDate}
                sx={{
                  background:
                    "var(--horizontal-gradient, linear-gradient(to right, #195490ff, #1565c0))",
                  color: "white",
                  textTransform: "none",
                  px: 2,
                  borderRadius: "8px",
                  "&:hover": {
                    background:
                      "var(--vertical-gradient, linear-gradient(to bottom, #26517bff, #1565c0))",
                  },
                  "&:disabled": {
                    background: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                }}
              >
                Apply
              </Button>
              {customDateFilter && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearDateFilter}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    borderColor: "#e0e0e0",
                    color: "#757575",
                    "&:hover": {
                      borderColor: "#bdbdbd",
                      background: "#f5f5f5",
                    },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
          }}
        >
          {selectedTable !== "all" && (
            <Button
              variant="contained"
              startIcon={<RestoreIcon />}
              onClick={() =>
                setRestoreDialog({ open: true, type: "table", data: selectedTable })
              }
              disabled={restoring || !archives[selectedTable]?.count}
              sx={{
                background: "linear-gradient(135deg, #32438dff 0%, #4f2876ff 100%)",
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
              }}
            >
              Restore Table
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<RestoreIcon />}
            onClick={() =>
              setRestoreDialog({ open: true, type: "all", data: null })
            }
            disabled={restoring || totalRecords === 0}
            sx={{
              background: "linear-gradient(135deg, #5f1268ff 0%, #7e0716ff 100%)",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
            }}
          >
            Restore All
          </Button>
        </Box>

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              gap: 2,
            }}
          >
            <CircularProgress
              size={45}
              thickness={4}
              sx={{ color: "var(--primary-color)" }}
            />
            <Typography
              sx={{
                color: "#757575",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              Loading archives...
            </Typography>
          </Box>
        ) : filteredData.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              gap: 2,
              p: 2,
            }}
          >
            <ArchiveIcon sx={{ fontSize: "4rem", color: "#e0e0e0" }} />
            <Typography
              sx={{
                color: "#757575",
                fontSize: { xs: "16px", sm: "18px" },
                fontWeight: 600,
              }}
            >
              No Archived Records
            </Typography>
            <Typography
              sx={{
                color: "#9e9e9e",
                fontSize: { xs: "13px", sm: "14px" },
                textAlign: "center",
              }}
            >
              {searchQuery
                ? `No results match "${searchQuery}"`
                : "All your data is active. Nothing to restore!"}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table */}
            <TableContainer
              sx={{
                flex: 1,
                overflow: "auto",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "15%",
                        minWidth: "120px",
                      }}
                    >
                      Table
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "15%",
                        minWidth: "120px",
                      }}
                    >
                      Record ID
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "40%",
                        minWidth: "300px",
                      }}
                    >
                      Details
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "20%",
                        minWidth: "160px",
                      }}
                    >
                      Archived Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "10%",
                        minWidth: "100px",
                        textAlign: "center",
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRecords.map((row, index) => (
                    <TableRow
                      key={row._id || index}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.08)",
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={row._tableName}
                          size="small"
                          sx={{
                            background: "var(--primary-color)",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "monospace",
                            fontSize: { xs: "12px", sm: "13px" },
                            color: "#616161",
                          }}
                        >
                          {row._id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          {Object.entries(row)
                            .filter(
                              ([key]) =>
                                !["_id", "__v", "archive", "password", "_tableName"].includes(
                                  key
                                )
                            )
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <Typography
                                key={key}
                                sx={{
                                  fontSize: { xs: "12px", sm: "13px" },
                                  color: "#616161",
                                }}
                              >
                                <strong>{key}:</strong>{" "}
                                {typeof value === "object"
                                  ? JSON.stringify(value).slice(0, 50) + "..."
                                  : String(value).slice(0, 50)}
                              </Typography>
                            ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: "#757575",
                            fontSize: { xs: "12px", sm: "14px" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(row.updatedAt || row.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Tooltip title="Restore this record">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setRestoreDialog({
                                open: true,
                                type: "single",
                                data: row,
                              })
                            }
                            sx={{
                              color: "#28a745",
                              "&:hover": {
                                backgroundColor: "rgba(40, 167, 69, 0.1)",
                              },
                            }}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: "1px solid #e0e0e0",
                flexShrink: 0,
                "& .MuiTablePagination-toolbar": {
                  px: { xs: 1, sm: 2, md: 3 },
                  minHeight: { xs: "52px", sm: "56px" },
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: { xs: "12px", sm: "14px" },
                    margin: 0,
                  },
              }}
            />
          </Box>
        )}
      </Paper>

      
      <Dialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, type: "", data: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Restore
        </DialogTitle>
        <DialogContent>
          <Typography>
            {restoreDialog.type === "single" &&
              "Are you sure you want to restore this record?"}
            {restoreDialog.type === "table" &&
              `Are you sure you want to restore all records from "${restoreDialog.data}" table?`}
            {restoreDialog.type === "all" &&
              "Are you sure you want to restore ALL archived records? This action will restore everything!"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRestoreDialog({ open: false, type: "", data: null })}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRestore}
            disabled={restoring}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              textTransform: "none",
            }}
          >
            {restoring ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ArchiveManagement;