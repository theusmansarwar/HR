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
import { createAttendance } from "../../DAL/create";
import { updateAttendance } from "../../DAL/edit";
import { fetchEmployees } from "../../DAL/fetch";
import { useAlert } from "../Alert/AlertContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

const statuses = ["Present", "Absent", "Leave", "Late", "Half Day"];
const shifts = ["Morning", "Evening", "Night"];

export default function AddAttendance({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const { showAlert } = useAlert();

  const initialForm = {
    attendanceId: "",
    employeeId: "",
    status: "Present",
    checkInTime: "",
    checkOutTime: "",
    shiftName: "",
    overtimeHours: 0,
  };

  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState({});
  const [employees, setEmployees] = React.useState([]);
  const [id, setId] = React.useState("");

  // Fetch employees once
  React.useEffect(() => {
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

  // Prefill form for edit
  React.useEffect(() => {
    if (Modeldata) {
      const selectedEmployeeId =
        typeof Modeldata.employeeId === "object"
          ? Modeldata.employeeId._id
          : Modeldata.employeeId;

      setForm({
        attendanceId: Modeldata.attendanceId || "",
        employeeId: selectedEmployeeId || "",
        status: Modeldata.status || "Present",
        checkInTime: Modeldata.checkInTime || "",
        checkOutTime: Modeldata.checkOutTime || "",
        shiftName: Modeldata.shiftName || "",
        overtimeHours: Modeldata.overtimeHours || 0,
      });
      setId(Modeldata._id || "");
    } else {
      setForm(initialForm);
      setId("");
    }
  }, [Modeldata]);

  const handleClose = () => {
    setErrors({});
    setOpen(false);
    setForm(initialForm);
    setId("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // trim string values
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    setForm((prev) => ({ ...prev, [name]: trimmedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = { ...form };
      let response;

      if (Modeltype === "Add") {
        response = await createAttendance(payload);
      } else {
        response = await updateAttendance(id, payload);
      }

      // ✅ success case
      if (response.status === 200 || response.status === 201) {
        showAlert("success", response.message || "Attendance saved successfully");
        onSave?.(response.data);
        onResponse?.({
          messageType: "success",
          message: response.message || "Attendance saved successfully",
        });
        handleClose();
      }
      // ⚠️ backend validation errors
      else if (response.status === 400 && response.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
        showAlert("error", response.message || "Validation failed");
        onResponse?.({
          messageType: "error",
          message: response.message || "Validation failed",
        });
      }
      // ❌ other errors
      else {
        showAlert("error", response.message || "Something went wrong");
        onResponse?.({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      showAlert("error", "Internal Server Error");
      onResponse?.({ messageType: "error", message: "Internal Server Error" });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Attendance
        </Typography>

        {Modeldata && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Attendance ID"
                value={Modeldata.attendanceId}
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
              label="Employee"
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
                  {emp.employeeId || "N/A"} - {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={form.status}
              onChange={handleChange}
              error={!!errors.status}
              helperText={errors.status}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Shift"
              name="shiftName"
              fullWidth
              value={form.shiftName}
              onChange={handleChange}
              error={!!errors.shiftName}
              helperText={errors.shiftName}
            >
              {shifts.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Check In Time"
              name="checkInTime"
              fullWidth
              required
              value={form.checkInTime}
              onChange={handleChange}
              error={!!errors.checkInTime}
              helperText={errors.checkInTime}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Check Out Time"
              name="checkOutTime"
              fullWidth
              required
              value={form.checkOutTime}
              onChange={handleChange}
              error={!!errors.checkOutTime}
              helperText={errors.checkOutTime}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Overtime Hours"
              name="overtimeHours"
              type="number"
              fullWidth
              value={form.overtimeHours}
              onChange={handleChange}
              error={!!errors.overtimeHours}
              helperText={errors.overtimeHours}
            />
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
