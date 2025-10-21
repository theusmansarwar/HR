 import React, { useState,useEffect } from "react";
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
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MdDelete } from "react-icons/md";

export function useEmployeesTable({ limitPerPage = 5 }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(limitPerPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const departments = [
    { id: "D1", name: "HR" },
    { id: "D2", name: "IT" },
    { id: "D3", name: "Finance" },
    { id: "D4", name: "Marketing" },
    { id: "D5", name: "Software Development" },
    { id: "D6", name: "Sales" },
    { id: "D7", name: "Customer Support" },
  ];
  const designations = [
    { id: "DG1", name: "Manager" },
    { id: "DG2", name: "Developer" },
    { id: "DG3", name: "Analyst" },
    { id: "DG4", name: "Executive" },
    { id: "DG5", name: "Frontend Developer" },
    { id: "DG6", name: "Backend Developer" },
    { id: "DG7", name: "Full Stack Developer" },
  ];

  const [newEmployee, setNewEmployee] = useState({
    fullName: "",
    cnic: "",
    email: "",
    phone: "",
    departmentId: "",
    designationId: "",
    joiningDate: "",
    salary: "",
    status: "Active",
    documents: null,
  });

  const [employees, setEmployees] = useState([
    {
      id: 1,
      fullName: "Rahma Sohail",
      cnic: "35201-1234567-1",
      email: "rahmasohail@gmail.com",
      phone: "03001234567",
      departmentId: "D1",
      designationId: "DG1",
      joiningDate: "2023-05-10",
      salary: "100000",
      status: "Active",
      documents: null,
    },
    {
      id: 2,
      fullName: "Areeba Abdullah",
      cnic: "35201-1234567-1",
      email: "areeba@gmail.com",
      phone: "03001234567",
      departmentId: "D2",
      designationId: "DG2",
      joiningDate: "2023-05-10",
      salary: "90,000",
      status: "Active",
      documents: null,
    },
      {
      id: 3,
      fullName: "Khadija Rehan ",
      cnic: "35201-1234567-1",
      email: "khadijarehan@gmail.com",
      phone: "03001234567",
      departmentId: "D3",
      designationId: "DG3",
      joiningDate: "2023-05-10",
      salary: "90,000",
      status: "Active",
      documents: null,
    },
     {
      id: 4,
      fullName: "Mateeaa Noor ",
      cnic: "35201-156789-1",
      email: "mateeanoor@gmail.com",
      phone: "03001234567",
      departmentId: "D6",
      designationId: "DG7",
      joiningDate: "2023-05-10",
      salary: "90,000",
      status: "Active",
      documents: null,
    },
  ]);
    useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  const filteredData = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(paginatedData.map((emp) => emp.id));
    } else {
      setSelected([]);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "documents") {
      setNewEmployee({ ...newEmployee, [name]: files[0] });
    } else {
      setNewEmployee({ ...newEmployee, [name]: value });
    }
  };

  const handleAddEmployee = () => {
    const newEmp = {
      id: employees.length + 1, 
      ...newEmployee,
    };
    setEmployees([...employees, newEmp]);
    setNewEmployee({
      fullName: "",
      cnic: "",
      email: "",
      phone: "",
      departmentId: "",
      designationId: "",
      joiningDate: "",
      salary: "",
      status: "Active",
      documents: null,
    });
    handleCloseDialog();
  };

  return {
    tableUI: (
      <Box sx={{ width: "100%" }}>
        <Paper
          sx={{
            width: "100%",
            maxHeight: "95vh",
            boxShadow: "none",
            backgroundColor: "darkblue",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5" sx={{ color: "white" }}>
              Employees List
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search Employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  minWidth: "250px",
                  backgroundColor: "white",
                  borderRadius: "2px",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ color: "darkblue", cursor: "pointer" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                sx={{ backgroundColor: "white", color: "darkblue", fontWeight: "bold" }}
                onClick={handleOpenDialog}
              >
             Add Employee
              </Button>
            </Box>
          </Toolbar>

          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "lightgray" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      sx={{ color: "darkblue" }}
                      indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                      checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>ID</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>CNIC</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Email</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Phone</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Department</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Designation</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Joining Date</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Salary</TableCell>
                  <TableCell sx={{ fontWeight:"bold", color: "darkblue", fontSize: "16px"}}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody sx={{ backgroundColor: "lightblue" }}>
                {paginatedData.map((row) => {
                  const isItemSelected = selected.includes(row.id);
                  return (
                    <TableRow key={row.id} selected={isItemSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          sx={{ color: "darkblue" }}
                          checked={isItemSelected}
                          onChange={() => handleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>{row.cnic}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>
                        {departments.find((d) => d.id === row.departmentId)?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {designations.find((dg) => dg.id === row.designationId)?.name || "N/A"}
                      </TableCell>
                      <TableCell>{row.joiningDate}</TableCell>
                      <TableCell>{row.salary}</TableCell>
                      <TableCell sx={{ color: row.status === "Active" ? "green" : "red" }}>
                        {row.status}
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
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ backgroundColor: "darkblue", color: "white" }}
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Full Name" name="fullName" value={newEmployee.fullName} onChange={handleInputChange} fullWidth />
            <TextField label="CNIC" name="cnic" value={newEmployee.cnic} onChange={handleInputChange} fullWidth />
            <TextField label="Email" name="email" value={newEmployee.email} onChange={handleInputChange} fullWidth />
            <TextField label="Phone" name="phone" value={newEmployee.phone} onChange={handleInputChange} fullWidth />

            <TextField
              select
              label="Department"
              name="departmentId"
              value={newEmployee.departmentId}
              onChange={handleInputChange}
              fullWidth
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Designation"
              name="designationId"
              value={newEmployee.designationId}
              onChange={handleInputChange}
              fullWidth
            >
              {designations.map((des) => (
                <MenuItem key={des.id} value={des.id}>
                  {des.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={newEmployee.joiningDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField label="Salary" name="salary" value={newEmployee.salary} onChange={handleInputChange} fullWidth />

            <TextField
              select
              label="Status"
              name="status"
              value={newEmployee.status}
              onChange={handleInputChange}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>

            <Button variant="outlined" component="label">
              Upload Documents
              <input type="file" hidden name="documents" onChange={handleInputChange} />
            </Button>
            {newEmployee.documents && <Typography>{newEmployee.documents.name}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="error">Cancel</Button>
            <Button onClick={handleAddEmployee} variant="contained" sx={{ backgroundColor: "darkblue" }}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    ),
  };
}
