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

  React.useEffect(() => {
    console.log("=== DEBUG START ===");
    console.log("Modeldata:", Modeldata);
    console.log("Modeltype:", Modeltype);
    
    if (Modeldata) {
      console.log("checkInTime raw:", Modeldata.checkInTime);
      console.log("checkInTime type:", typeof Modeldata.checkInTime);
      console.log("checkOutTime raw:", Modeldata.checkOutTime);
      console.log("checkOutTime type:", typeof Modeldata.checkOutTime);
      
      const selectedEmployeeId =
        typeof Modeldata.employeeId === "object"
          ? Modeldata.employeeId._id
          : Modeldata.employeeId;

      const formatTime = (time) => {
        console.log("formatTime input:", time);
        if (!time) {
          console.log("Time is empty/null/undefined");
          return "";
        }
        
        if (typeof time === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
          console.log("Time already in correct format:", time);
          return time.substring(0, 5);
        }
        
        try {
          const date = new Date(time);
          console.log("Date object created:", date);
          console.log("Is valid date?", !isNaN(date.getTime()));
          
          if (isNaN(date.getTime())) {
            console.log("Invalid date, returning empty");
            return "";
          }
          
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const formatted = `${hours}:${minutes}`;
          console.log("Formatted time:", formatted);
          return formatted;
        } catch (error) {
          console.error("Error formatting time:", error);
          return "";
        }
      };

      const formattedCheckIn = formatTime(Modeldata.checkInTime);
      const formattedCheckOut = formatTime(Modeldata.checkOutTime);
      
      console.log("Final checkInTime:", formattedCheckIn);
      console.log("Final checkOutTime:", formattedCheckOut);

      setForm({
        attendanceId: Modeldata.attendanceId || "",
        employeeId: selectedEmployeeId || "",
        status: Modeldata.status || "Present",
        checkInTime: formattedCheckIn,
        checkOutTime: formattedCheckOut,
        shiftName: Modeldata.shiftName || "",
        overtimeHours: Modeldata.overtimeHours || 0,
      });
      setId(Modeldata._id || "");
      console.log("=== DEBUG END ===");
    } else {
      setForm(initialForm);
      setId("");
    }
  }, [Modeldata, open]); 

  const handleClose = () => {
    setErrors({});
    setOpen(false);
    setForm(initialForm);
    setId("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    setForm((prev) => ({ ...prev, [name]: trimmedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let tempErrors = {};
    if (form.overtimeHours < 0) {
      tempErrors.overtimeHours = "Overtime hours must be a positive value";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      showAlert("error", "Please fix the errors before submitting");
      return; 
    
    }

    try {
      const payload = { ...form };
      let response;

      if (Modeltype === "Add") {
        response = await createAttendance(payload);
      } else {
        response = await updateAttendance(id, payload);
      }

      if (response.status === 200 || response.status === 201) {
        showAlert(
          "success",
          response.message || "Attendance saved successfully"
        );
        onSave?.(response.data);
        onResponse?.({
          messageType: "success",
          message: response.message || "Attendance saved successfully",
        });
        handleClose();
      } else if (response.status === 400 && response.missingFields) {
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
      } else {
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
              type="time"
              fullWidth
              required
              value={form.checkInTime}
              onChange={handleChange}
              error={!!errors.checkInTime}
              helperText={errors.checkInTime}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Check Out Time"
              name="checkOutTime"
              type="time"
              fullWidth
              required
              value={form.checkOutTime}
              onChange={handleChange}
              error={!!errors.checkOutTime}
              helperText={errors.checkOutTime}
              InputLabelProps={{ shrink: true }}
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
              inputProps={{ min: 0 }}
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