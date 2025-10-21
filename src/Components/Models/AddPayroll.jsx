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

import { createPayroll } from "../../DAL/create";
import { updatePayroll } from "../../DAL/edit";
import { fetchEmployees } from "../../DAL/fetch";

const archiveOptions = ["Yes", "No"];
const paymentOptions = ["Cash", "Bank Transfer", "Cheque"];
const statusOptions = ["Paid", "Pending", "Unpaid"];

const AddPayroll = ({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) => {
  const [payroll, setPayroll] = useState({
    _id: "",
    employeeId: "",
    month: "",
    year: new Date().getFullYear(),
    basicSalary: "",
    allowances: 0,
    deductions: "",
    overtime: "",
    bonuses: 0,
    netSalary: "",
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().split("T")[0], // yyyy-mm-dd
    status: "Pending",
    archive: "No",
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
      setPayroll({
        _id: Modeldata?._id || "",
        employeeId: Modeldata?.employeeId?._id || Modeldata?.employeeId || "",
        month: Modeldata?.month || "",
        year: Modeldata?.year || new Date().getFullYear(),
        basicSalary: Modeldata?.basicSalary || "",
        allowances: Modeldata?.allowances || 0,
        deductions: Modeldata?.deductions || "",
        overtime: Modeldata?.overtime || "",
        bonuses: Modeldata?.bonuses || 0,
        netSalary: Modeldata?.netSalary || "",
        paymentMethod: Modeldata?.paymentMethod || "Cash",
        paymentDate:
          Modeldata?.paymentDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        status: Modeldata?.status || "Pending",
        archive: Modeldata?.archive || "No",
      });
    } else {
      setPayroll({
        _id: "",
        employeeId: "",
        month: "",
        year: new Date().getFullYear(),
        basicSalary: "",
        allowances: 0,
        deductions: "",
        overtime: "",
        bonuses: 0,
        netSalary: "",
        paymentMethod: "Cash",
        paymentDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        archive: "No",
      });
    }
  }, [Modeltype, Modeldata, open]);

  // ✅ Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayroll((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      if (Modeltype === "Add") {
        response = await createPayroll(payroll);
      } else {
        response = await updatePayroll(payroll._id, payroll);
      }

      console.log("Payroll API Response:", response);

      if (response?.status === 200 || response?.status === 201 || response?.data) {
        if (onSave) onSave(response.data || payroll);
        if (onResponse)
          onResponse({ message: `${Modeltype} Payroll Successfully!` });
        setOpen(false);
      } else {
        if (onResponse) onResponse({ message: "Failed to save payroll" });
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (onResponse) onResponse({ message: "Error while saving payroll" });
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {Modeltype === "Add" ? "Add Payroll" : "Update Payroll"}
        </DialogTitle>

        <DialogContent>
          {/* ✅ Employee Dropdown */}
          <TextField
            select
            margin="dense"
            label="Employee"
            name="employeeId"
            fullWidth
            value={payroll.employeeId}
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
            margin="dense"
            label="Month"
            name="month"
            value={payroll.month}
            onChange={handleChange}
            fullWidth
            placeholder="e.g. October"
          />

          <TextField
            margin="dense"
            label="Year"
            name="year"
            type="number"
            value={payroll.year}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="Basic Salary"
            name="basicSalary"
            type="number"
            value={payroll.basicSalary}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="Allowances"
            name="allowances"
            type="number"
            value={payroll.allowances}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="Bonuses"
            name="bonuses"
            type="number"
            value={payroll.bonuses}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="Deductions"
            name="deductions"
            type="number"
            value={payroll.deductions}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="Overtime"
            name="overtime"
            type="number"
            value={payroll.overtime}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            label="Net Salary"
            name="netSalary"
            type="number"
            value={payroll.netSalary}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            margin="dense"
            label="Payment Method"
            name="paymentMethod"
            value={payroll.paymentMethod}
            onChange={handleChange}
            fullWidth
          >
            {paymentOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Payment Date"
            name="paymentDate"
            type="date"
            value={payroll.paymentDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            margin="dense"
            label="Status"
            name="status"
            value={payroll.status}
            onChange={handleChange}
            fullWidth
          >
            {statusOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            margin="dense"
            label="Archive"
            name="archive"
            value={payroll.archive}
            onChange={handleChange}
            fullWidth
          >
            {archiveOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
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

export default AddPayroll;
