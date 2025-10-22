import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import { createPayroll } from "../../DAL/create";
import { updatePayroll } from "../../DAL/edit";
import { fetchEmployees } from "../../DAL/fetch";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "65%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

const paymentMethods = ["Cash", "Bank Transfer", "Cheque"];
const statuses = ["Paid", "Pending", "Unpaid"];
const archiveOptions = ["Yes", "No"];

export default function AddPayroll({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    employeeId: "",
    month: "",
    year: new Date().getFullYear(),
    basicSalary: "",
    allowances: "",
    deductions: "",
    overtime: "",
    bonuses: "",
    netSalary: "",
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
    status: "Pending",
    isArchived: "No",
  });

  const [employees, setEmployees] = React.useState([]);
  const [id, setId] = React.useState("");

  // ✅ Fetch Employees once
  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees();
        setEmployees(res?.data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    loadEmployees();
  }, []);

  // ✅ Pre-fill on Update
  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        employeeId: Modeldata?.employeeId?._id || "",
        month: Modeldata?.month || "",
        year: Modeldata?.year || new Date().getFullYear(),
        basicSalary: Modeldata?.basicSalary || "",
        allowances: Modeldata?.allowances || "",
        deductions: Modeldata?.deductions || "",
        overtime: Modeldata?.overtime || "",
        bonuses: Modeldata?.bonuses || "",
        netSalary: Modeldata?.netSalary || "",
        paymentMethod: Modeldata?.paymentMethod || "Cash",
        paymentDate: Modeldata?.paymentDate
          ? Modeldata.paymentDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: Modeldata?.status || "Pending",
        isArchived: Modeldata?.isArchived || "No",
      });
      setId(Modeldata?._id || "");
    } else {
      // reset for Add
      setForm({
        employeeId: "",
        month: "",
        year: new Date().getFullYear(),
        basicSalary: "",
        allowances: "",
        deductions: "",
        overtime: "",
        bonuses: "",
        netSalary: "",
        paymentMethod: "Cash",
        paymentDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        isArchived: "No",
      });
      setId("");
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (Modeltype === "Add") {
        response = await createPayroll(form);
      } else {
        response = await updatePayroll(id, form);
      }

      if (response?.data) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Payroll saved successfully",
        });
      } else {
        onResponse({
          messageType: "error",
          message: "Something went wrong while saving payroll",
        });
      }

      setOpen(false);
    } catch (error) {
      console.error("Error saving payroll:", error);
      onResponse({
        messageType: "error",
        message: "Error saving payroll",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Payroll
        </Typography>

        {Modeldata && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Payroll ID"
                value={Modeldata?.payrollId || ""}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        )}

        <Grid container spacing={2}>
          {/* Employee Dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              label="Select Employee"
              name="employeeId"
              fullWidth
              required
              value={form.employeeId}
              onChange={handleChange}
            >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.employeeId} - {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Month"
              name="month"
              fullWidth
              required
              value={form.month}
              onChange={handleChange}
              placeholder="e.g. October"
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Year"
              name="year"
              type="number"
              fullWidth
              required
              value={form.year}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Basic Salary"
              name="basicSalary"
              type="number"
              fullWidth
              required
              value={form.basicSalary}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Allowances"
              name="allowances"
              type="number"
              fullWidth
              value={form.allowances}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Bonuses"
              name="bonuses"
              type="number"
              fullWidth
              value={form.bonuses}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Deductions"
              name="deductions"
              type="number"
              fullWidth
              value={form.deductions}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Overtime"
              name="overtime"
              type="number"
              fullWidth
              value={form.overtime}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Net Salary"
              name="netSalary"
              type="number"
              fullWidth
              required
              value={form.netSalary}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Payment Method"
              name="paymentMethod"
              fullWidth
              value={form.paymentMethod}
              onChange={handleChange}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Payment Date"
              name="paymentDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.paymentDate}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={form.status}
              onChange={handleChange}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button onClick={handleClose} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
