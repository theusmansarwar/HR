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
  Tabs,
  Tab,
  CircularProgress,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { fetchActivity } from "../../DAL/fetch";
import { formatDate } from "../../Utils/Formatedate";
import { useNavigate } from "react-router-dom";

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customDateFilter, setCustomDateFilter] = useState(false);

  // Fetch data from API
  const fetchDataFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetchActivity(page + 1, rowsPerPage, "");
      
      if (response?.status === 400) {
        localStorage.removeItem("Token");
        navigate("/login");
      } else {
        const activities = response?.data || [];
        setAllData(activities);
        setTotalRecords(response?.total || 0);
        applyFilters(activities, activeTab, searchQuery);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setAllData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDataFromAPI();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, rowsPerPage]);

  // Apply both tab filter and search filter
  const applyFilters = (activities, tabIndex, searchText, useCustomDate = false) => {
    let filtered = [...activities];
    
    // Apply custom date filter if enabled
    if (useCustomDate && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    } else {
      // Apply tab filter only if not using custom date
      filtered = filterByTab(activities, tabIndex);
    }
    
    // Then apply search filter
    if (searchText && searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const userName = item.user?.userName?.toLowerCase() || "";
        const action = item.action?.toLowerCase() || "";
        const module = item.module?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        
        // Format date and create multiple search patterns
        const dateStr = item.createdAt || "";
        const dateObj = new Date(dateStr);
        
        // Create various date formats for searching
        const formattedDate = formatDate(dateStr).toLowerCase();
        const dayMonth = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        const monthDay = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
        const year = dateObj.getFullYear().toString();
        const shortYear = year.slice(-2);
        const fullDate = `${dayMonth}/${year}`;
        const shortDate = `${dayMonth}/${shortYear}`;
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;
        
        return (
          userName.includes(searchLower) ||
          action.includes(searchLower) ||
          module.includes(searchLower) ||
          description.includes(searchLower) ||
          formattedDate.includes(searchLower) ||
          dayMonth.includes(searchLower) ||
          monthDay.includes(searchLower) ||
          fullDate.includes(searchLower) ||
          shortDate.includes(searchLower) ||
          time.includes(searchLower) ||
          year.includes(searchLower) ||
          shortYear.includes(searchLower)
        );
      });
    }
    
    setFilteredData(filtered);
  };

  // Filter data based on selected tab
  const filterByTab = (activities, tabIndex) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let filtered = [...activities];

    switch (tabIndex) {
      case 1: // Today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        filtered = activities.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= todayStart && itemDate <= now;
        });
        break;
      case 2: // Yesterday
        const yesterdayEnd = new Date(now);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const yesterdayStart = new Date(yesterdayEnd);
        yesterdayStart.setHours(0, 0, 0, 0);
        filtered = activities.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= yesterdayStart && itemDate <= yesterdayEnd;
        });
        break;
      case 3: // Last 7 Days
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        filtered = activities.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= sevenDaysAgo && itemDate <= now;
        });
        break;
      case 4: // Last 15 Days
        const fifteenDaysAgo = new Date(now);
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        fifteenDaysAgo.setHours(0, 0, 0, 0);
        filtered = activities.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= fifteenDaysAgo && itemDate <= now;
        });
        break;
      case 5: // This Month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        filtered = activities.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= monthStart && itemDate <= now;
        });
        break;
      default: // All
        filtered = activities;
    }

    return filtered;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCustomDateFilter(false);
    setStartDate("");
    setEndDate("");
    applyFilters(allData, newValue, searchQuery, false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(allData, activeTab, value, customDateFilter);
  };

  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      setCustomDateFilter(true);
      setActiveTab(-1); // Deselect tabs
      applyFilters(allData, activeTab, searchQuery, true);
    }
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCustomDateFilter(false);
    setActiveTab(0);
    applyFilters(allData, 0, searchQuery, false);
  };

  // Get row background color based on action
  const getRowColor = (action) => {
    const actionLower = action?.toLowerCase() || "";
    
    if (actionLower.includes("create") || actionLower.includes("add")) {
      return "rgba(76, 175, 80, 0.08)";
    } else if (actionLower.includes("delete") || actionLower.includes("remove")) {
      return "rgba(244, 67, 54, 0.08)";
    } else if (actionLower.includes("update") || actionLower.includes("edit")) {
      return "rgba(255, 193, 7, 0.08)";
    } else if (actionLower.includes("login")) {
      return "rgba(33, 150, 243, 0.08)";
    }
    return "transparent";
  };

  return (
    <Box sx={{ 
      width: "100%", 
      height: "100vh",
      p: { xs: 1, sm: 2, md: 3 },
      overflow: "hidden"
    }}>
      <Paper 
        sx={{ 
          width: "100%",
          height: "100%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
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
            flexShrink: 0
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: "var(--primary-color, #1976d2)",
              fontWeight: 600,
              fontSize: { xs: "1.25rem", sm: "1.5rem" }
            }}
          >
            Activity Logs
          </Typography>

          <TextField
            size="small"
            placeholder="Search by action or date..."
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
                  borderColor: "var(--primary-color, #1976d2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary-color, #1976d2)",
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

        {/* Tabs Section with Date Picker */}
        <Box sx={{ 
          borderBottom: "1px solid #e0e0e0", 
          px: { xs: 1, sm: 2, md: 3 },
          flexShrink: 0
        }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            flexWrap: "wrap",
            py: 1 
          }}>
            <Tabs
              value={customDateFilter ? false : activeTab}
              onChange={handleTabChange}
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
                  color: "var(--primary-color, #1976d2) !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "var(--primary-color, #1976d2)",
                },
              }}
            >
              <Tab label="All" />
              <Tab label="Today" />
              <Tab label="Yesterday" />
              <Tab label="Last 7 Days" />
              <Tab label="Last 15 Days" />
              <Tab label="This Month" />
            </Tabs>

            {/* Date Range Picker */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              flexWrap: { xs: "wrap", md: "nowrap" }
            }}>
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
                  background: "var(--horizontal-gradient, linear-gradient(to right, #1976d2, #1565c0))",
                  color: "white",
                  textTransform: "none",
                  px: 2,
                  borderRadius: "8px",
                  "&:hover": {
                    background: "var(--vertical-gradient, linear-gradient(to bottom, #1976d2, #1565c0))",
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
              sx={{ color: "var(--primary-color, #1976d2)" }}
            />
            <Typography
              sx={{
                color: "#757575",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              Loading activity logs...
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
            <Typography
              sx={{
                color: "#757575",
                fontSize: { xs: "16px", sm: "18px" },
                fontWeight: 600,
              }}
            >
              No Activity Logs Found
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
                : "No activities available for this time period"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1, 
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Table */}
            <TableContainer sx={{ 
              flex: 1,
              overflow: "auto"
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: "#616161",
                      width: "15%",
                      minWidth: "120px"
                    }}>
                      User
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: "#616161",
                      width: "15%",
                      minWidth: "120px"
                    }}>
                      Module
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: "#616161", 
                      width: "50%",
                      minWidth: "300px"
                    }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: "#616161",
                      width: "20%",
                      minWidth: "160px"
                    }}>
                      Date & Time
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow
                      key={row._id || index}
                      sx={{
                        backgroundColor: getRowColor(row.action),
                        "&:hover": {
                          backgroundColor: getRowColor(row.action)
                            ? getRowColor(row.action)
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ 
                          fontWeight: 500,
                          fontSize: { xs: "13px", sm: "14px" }
                        }}>
                          {row.user?.userName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ 
                          color: "#424242",
                          fontSize: { xs: "13px", sm: "14px" }
                        }}>
                          {row.module || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          sx={{ 
                            color: "#616161",
                            fontSize: { xs: "13px", sm: "14px" },
                          }}
                        >
                          {row.description || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ 
                          color: "#757575", 
                          fontSize: { xs: "12px", sm: "14px" },
                          whiteSpace: "nowrap"
                        }}>
                          {formatDate(row.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
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
                  minHeight: { xs: "52px", sm: "56px" }
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: { xs: "12px", sm: "14px" },
                  margin: 0
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ActivityLogs;