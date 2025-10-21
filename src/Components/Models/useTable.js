import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
  Checkbox,
  Button,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchallcategorylist,
  fetchDepartments,
  fetchDesignations,
  fetchEmployees,
  fetchAttendance,
  fetchLeaves,
  fetchJobs,
  fetchApplications,
  fetchPerformance,
  fetchTrainings,
  fetchPayrolls,
  fetchFines,
  getRoles,
} from "../../DAL/fetch";
import { formatDate } from "../../Utils/Formatedate";
import truncateText from "../../truncateText";
import { useNavigate } from "react-router-dom";
import AddCategories from "./addcategorie";
import {
  deleteAllCategories,
  deleteDepartment,
  deleteDesignation,
  deleteEmployee,
  deleteAttendance,
  deleteLeaves,
  deleteJobs,
  deleteApplications,
  deletePerformance,
  deleteTraining,
  deletePayroll,
  deleteFines,
} from "../../DAL/delete";
import { useAlert } from "../Alert/AlertContext";
import DeleteModal from "./confirmDeleteModel";

export function useTable({
  attributes = [],
  tableType,
  pageData = [],
  limitPerPage = 10,
  onAdd,
  onEdit,
  onView,
}) {
  const { showAlert } = useAlert();
  const savedState =
    JSON.parse(localStorage.getItem(`${tableType}-tableState`)) || {};
  const [page, setPage] = useState(savedState.page || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    savedState.rowsPerPage || limitPerPage
  );
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery || "");
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [modeltype, setModeltype] = useState("Add");
  const [modelData, setModelData] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const fetchData = async () => {
    let response;

    if (tableType === "Categories") {
      response = await fetchallcategorylist(page, rowsPerPage, searchQuery);
      if (response.status === 400) {
        localStorage.removeItem("Token");
        navigate("/login");
      } else {
        setData(response.categories || []);
        setTotalRecords(response.categories ? response.categories.length : 0);
      }
    } else if (tableType === "Employees") {
      response = await fetchEmployees(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Departments") {
      response = await fetchDepartments(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Designations") {
      response = await fetchDesignations(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      } else if (response?.designations) {
        setData(response.designations);
        setTotalRecords(response.designations.length);
      }
    } else if (tableType === "Attendance") {
      response = await fetchAttendance(page, rowsPerPage, searchQuery);
      if (response?.data) {
        const attendanceArray = Array.isArray(response.data)
          ? response.data
          : [response.data];

        const formattedData = attendanceArray.map((att) => ({
          ...att,
          _id: att._id || att.attendanceId,
          isArchived: att.isArchived ?? att.archive === "Yes",
        }));

        setData(formattedData);
        setTotalRecords(formattedData.length);
      }
    } else if (tableType === "Leaves") {
      response = await fetchLeaves(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Jobs") {
      response = await fetchJobs(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Applications") {
      response = await fetchApplications(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Performance") {
      response = await fetchPerformance(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Training") {
      response = await fetchTrainings(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Payroll") {
      response = await fetchPayrolls(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else if (tableType === "Fines") {
      response = await fetchFines(page, rowsPerPage, searchQuery);
      if (response?.data) {
        setData(response.data);
        setTotalRecords(response.data.length);
      }
    } else {
      setData(pageData);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  useEffect(() => {
    localStorage.setItem(
      `${tableType}-tableState`,
      JSON.stringify({ page, rowsPerPage, searchQuery })
    );
  }, [page, rowsPerPage, searchQuery, tableType]);

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? data.map((row) => row._id) : []);
  };

  const isSelected = (id) => selected.includes(id);

  const handleChangePage = (_, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewClick = (row) => {
    if (onEdit) onEdit(row);
  };

  const handleSearch = () => {
    fetchData(page, rowsPerPage, searchQuery);
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("warning", "No items selected for deletion");
      return;
    }

    try {
      let response;
      if (tableType === "Categories") {
        response = await deleteAllCategories({ ids: selected });
      } else if (tableType === "Departments") {
        for (const id of selected) await deleteDepartment(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Designations") {
        for (const id of selected) await deleteDesignation(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Employees") {
        for (const id of selected) await deleteEmployee(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Attendance") {
        for (const id of selected) await deleteAttendance(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Leaves") {
        for (const id of selected) await deleteLeaves(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Jobs") {
        for (const id of selected) await deleteJobs(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Applications") {
        for (const id of selected) await deleteApplications(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Performance") {
        for (const id of selected) await deletePerformance(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Training") {
        for (const id of selected) await deleteTraining(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Payroll") {
        for (const id of selected) await deletePayroll(id);
        response = { status: 200, message: "Deleted successfully" };
      } else if (tableType === "Fines") {
        for (const id of selected) await deleteFines(id);
        response = { status: 200, message: "Deleted successfully" };
      }

      if (response?.status === 200) {
        showAlert("success", response.message || "Deleted successfully");
        setData((prevData) =>
          prevData.filter((row) => !selected.includes(row._id))
        );
        setSelected([]);
      } else {
        showAlert("error", response?.message || "Failed to delete items");
      }
    } catch (error) {
      console.error("Error in delete request:", error);
      showAlert("error", "Something went wrong. Try again later.");
    }
  };

  const handleAddButton = () => {
    if (tableType === "Categories") {
      setOpenCategoryModal(true);
      setModeltype("Add");
      setModelData({});
    } else if (typeof onAdd === "function") {
      onAdd();
    }
  };

  const getNestedValue = (obj, path) => {
    const value = path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : "N/A"),
        obj
      );

    if (typeof value === "object" && value !== null) {
      return (
        value.departmentName || value.designationName || JSON.stringify(value)
      );
    }

    return value;
  };

  const handleResponse = (response) => {
    showAlert(response.messageType, response.message);
    fetchData();
  };

  const handleDeleteClick = () => {
    setOpenDeleteModal(true);
  };

  return {
    tableUI: (
      <>
        <AddCategories
          open={openCategoryModal}
          setOpen={setOpenCategoryModal}
          Modeltype={modeltype}
          Modeldata={modelData}
          onResponse={handleResponse}
        />

        <DeleteModal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          onConfirm={handleDelete}
        />

        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", maxHeight: "95vh", boxShadow: "none" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h5" sx={{ color: "var(--primary-color)" }}>
                {tableType} List
              </Typography>
              <TextField
                size="small"
                placeholder={`Search ${tableType}...`}
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  minWidth: 200,
                  backgroundColor: "white",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "var(--background-color)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--background-color)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--background-color)",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        onClick={handleSearch}
                        sx={{
                          cursor: "pointer",
                          color: "var(--background-color)",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              {selected.length > 0 ? (
                <IconButton onClick={handleDeleteClick} sx={{ color: "red" }}>
                  <DeleteIcon />
                </IconButton>
              ) : (
                tableType !== "Comments" && (
                  <Button
                    sx={{
                      background: "var(--horizontal-gradient)",
                      color: "var(--white-color)",
                      borderRadius: "var(--border-radius-secondary)",
                      "&:hover": { background: "var(--vertical-gradient)" },
                    }}
                    onClick={handleAddButton}
                  >
                    Add {tableType}
                  </Button>
                )
              )}
            </Toolbar>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        sx={{ color: "var(--primary-color)" }}
                        indeterminate={
                          selected.length > 0 && selected.length < data.length
                        }
                        checked={
                          data.length > 0 && selected.length === data.length
                        }
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    {attributes.map((attr) => (
                      <TableCell
                        key={attr.id}
                        sx={{
                          color: "var(--secondary-color)",
                          minWidth: "150px",
                        }}
                      >
                        {attr.label}
                      </TableCell>
                    ))}
                    <TableCell sx={{ color: "var(--secondary-color)" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => {
                    // const isItemSelected = isSelected(
                    //   tableType === "Departments" ? row.id : row._id
                    // );
                    const isItemSelected = isSelected(row._id);


                    return (
                      <TableRow
                        key={row._id || row.id || `${tableType}-${index}`}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            sx={{ color: "var(--primary-color)" }}
                            checked={isItemSelected}
                            onChange={() => {
                              setSelected((prev) =>
                                isItemSelected
                                  ? prev.filter((selId) => selId !== row._id)
                                  : [...prev, row._id]
                              );
                            }}
                          />
                        </TableCell>

                        {attributes.map((attr) => (
                          <TableCell
                            key={attr.id}
                            sx={{ color: "var(--black-color)" }}
                          >
                            {attr.id === "createdAt" ||
                            attr.id === "publishedDate" ? (
                              formatDate(row[attr.id])
                            ) : attr.id === "published" ? (
                              <span
                                style={{
                                  color: row[attr.id]
                                    ? "var(--success-color)"
                                    : "var(--warning-color)",
                                  background: row[attr.id]
                                    ? "var(--success-bgcolor)"
                                    : "var(--warning-bgcolor)",
                                  padding: "5px",
                                  minWidth: "200px",
                                  borderRadius:
                                    "var(--border-radius-secondary)",
                                }}
                              >
                                {row[attr.id] ? "Public" : "Private"}
                              </span>
                            ) : row[attr.id] === 0 ? (
                              0
                            ) : typeof getNestedValue(row, attr.id) ===
                              "string" ? (
                              truncateText(getNestedValue(row, attr.id), 30)
                            ) : (
                              getNestedValue(row, attr.id)
                            )}
                          </TableCell>
                        ))}

                        <TableCell>
                          <span
                            onClick={() => handleViewClick(row)}
                            style={{
                              color: "var(--primary-color)",
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            View
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Box>
      </>
    ),
    fetchData,
  };
}
