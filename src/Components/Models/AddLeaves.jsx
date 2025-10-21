 import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import { createLeaves } from "../../DAL/create";
import { updateLeave } from "../../DAL/edit";
import { fetchEmployees } from "../../DAL/fetch";

const leaveTypes = ["Casual", "Sick", "Annual", "Maternity", "Paternity"];
const leaveStatus = ["Pending", "Approved", "Rejected"];

const AddLeave = ({ open, setOpen, Modeltype, Modeldata, onSave, onResponse }) => {
  const [leave, setLeave] = useState({
    _id: "",
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    status: "Pending",
  });

  const [employees, setEmployees] = useState([]);

  // ✅ Fetch Employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees();
        setEmployees(res?.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    loadEmployees();
  }, []);

  // ✅ Handle Update vs Add
  useEffect(() => {
    if (Modeltype === "Update" && Modeldata) {
      setLeave({
        _id: Modeldata?._id || "",
        employeeId: Modeldata?.employeeId?._id || Modeldata?.employeeId || "",
        leaveType: Modeldata?.leaveType || "",
        startDate: Modeldata?.startDate?.slice(0, 10) || "",
        endDate: Modeldata?.endDate?.slice(0, 10) || "",
        status: Modeldata?.status || "Pending",
      });
    } else {
      setLeave({
        _id: "",
        employeeId: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        status: "Pending",
      });
    }
  }, [Modeltype, Modeldata, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ prevent page reload
    try {
      let response;
      if (Modeltype === "Add") {
        response = await createLeaves(leave);
      } else {
        response = await updateLeave(leave._id, leave);
      }

      if (response?.status === 200 || response?.status === 201) {
        if (onSave) onSave(response.data || leave);
        if (onResponse) onResponse({ message: `${Modeltype} Leave Successfully!` });
        setOpen(false); // ✅ close modal always on success
      } else {
        if (onResponse) onResponse({ message: "Failed to save leave" });
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (onResponse) onResponse({ message: "Error while saving leave" });
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{Modeltype === "Add" ? "Add Leave" : "Update Leave"}</DialogTitle>
        <DialogContent>
          {/* ✅ Employee Dropdown */}
          <TextField
            select
            margin="dense"
            label="Employee"
            name="employeeId"
            fullWidth
            value={leave.employeeId}
            onChange={handleChange}
          >
            {employees.length > 0 ? (
              employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.employeeId} - {emp.firstName} {emp.lastName}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No employees found</MenuItem>
            )}
          </TextField>

          <TextField
            select
            margin="dense"
            label="Leave Type"
            name="leaveType"
            value={leave.leaveType}
            onChange={handleChange}
            fullWidth
          >
            {leaveTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Start Date"
            name="startDate"
            type="date"
            value={leave.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="End Date"
            name="endDate"
            type="date"
            value={leave.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            margin="dense"
            label="Status"
            name="status"
            value={leave.status}
            onChange={handleChange}
            fullWidth 
          >
            {leaveStatus.map((status, index) => (
              <MenuItem key={index} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained">
            {Modeltype === "Add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddLeave;
