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
  });

  const [employees, setEmployees] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [id, setId] = React.useState("");

  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        const empRes = await fetchEmployees();
        setEmployees(empRes?.data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    loadEmployees();
  }, []);

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
      });
      setId(Modeldata?._id || "");
      setErrors({});
    } else {
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
      });
      setId("");
      setErrors({});
    }
  }, [Modeldata]);

  const handleClose = () => {
    setErrors({});
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      let response;
      if (Modeltype === "Add") {
        response = await createPayroll(form);
      } else {
        response = await updatePayroll(id, form);
      }

      if (response.status === 200 || response.status === 201) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Payroll saved successfully",
        });
        setOpen(false);
      } else if (response.status === 400 && response.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
        onResponse({
          messageType: "error",
          message: response.message || "Validation failed",
        });
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error saving payroll:", error);
      onResponse({
        messageType: "error",
        message: "Internal Server Error",
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
          <Grid item xs={6}>
            <TextField
              select
              label="Select Employee"
              name="employeeId"
              fullWidth
              required
              value={form.employeeId}
              onChange={handleChange}
              error={!!errors.employeeId}
              helperText={errors.employeeId}
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
              error={!!errors.month}
              helperText={errors.month}
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
              error={!!errors.year}
              helperText={errors.year}
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
              error={!!errors.basicSalary}
              helperText={errors.basicSalary}
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
              error={!!errors.allowances}
              helperText={errors.allowances}
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
              error={!!errors.bonuses}
              helperText={errors.bonuses}
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
              error={!!errors.deductions}
              helperText={errors.deductions}
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
              error={!!errors.overtime}
              helperText={errors.overtime}
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
              error={!!errors.netSalary}
              helperText={errors.netSalary}
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
              error={!!errors.paymentMethod}
              helperText={errors.paymentMethod}
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
