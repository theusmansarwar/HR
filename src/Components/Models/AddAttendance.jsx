import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Grid,
  MenuItem,
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

const statuses = ["Present", "Absent", "Late", "On Leave"];
const shifts = ["Morning", "Evening", "Night"];

export default function AddAttendance({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
  onSave,
}) {
  const { showAlert } = useAlert();

  const [form, setForm] = React.useState({
    attendanceId: "",
    employeeId: "",
    archive: "No",
    date: "",
    status: "Present",
    checkInTime: "",
    checkOutTime: "",
    shiftName: "",
    overtimeHours: 0,
  });
  const [id, setId] = React.useState("");
  const [employees, setEmployees] = React.useState([]);

  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees();
        if (res?.data) setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    loadEmployees();
  }, []);

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        attendanceId: Modeldata?.attendanceId || "",
        employeeId: Modeldata?.employeeId || "",
        archive: Modeldata?.archive || "No",
        date: Modeldata?.date || "",
        status: Modeldata?.status || "Present",
        checkInTime: Modeldata?.checkInTime || "",
        checkOutTime: Modeldata?.checkOutTime || "",
        shiftName: Modeldata?.shiftName || "",
        overtimeHours: Modeldata?.overtimeHours || 0,
      });
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response;

    try {
      if (Modeltype === "Add") {
        response = await createAttendance(form);
      } else {
        response = await updateAttendance(id, form);
      }

      if (response?.status === 200 || response?.status === 201) {
        showAlert("success", response.message || `${Modeltype} successful`);
        onSave?.(response.data);
        onResponse?.({
          messageType: "success",
          message: response.message || `${Modeltype} successful`,
        });
      } else {
        showAlert("error", response.message || "Something went wrong");
        onResponse?.({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Attendance save error:", error);
      showAlert("error", "Something went wrong. Try again later.");
      onResponse?.({
        messageType: "error",
        message: "Something went wrong. Try again later.",
      });
    }

    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6">{Modeltype} Attendance</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Attendance ID"
              name="attendanceId"
              fullWidth
              value={form.attendanceId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Employee"
              name="employeeId"
              fullWidth
              value={form.employeeId}
              onChange={handleChange}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.employeeId} - {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} display="flex" alignItems="center" gap={1}>
            <input
              type="checkbox"
              name="archive"
              checked={form.archive === "Yes"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  archive: e.target.checked ? "Yes" : "No",
                }))
              }
            />
            <Typography>Archive Attendance</Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.date}
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
              {statuses.map((s, i) => (
                <MenuItem key={i} value={s}>
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
            >
              {shifts.map((s, i) => (
                <MenuItem key={i} value={s}>
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
              value={form.checkInTime}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Check Out Time"
              name="checkOutTime"
              fullWidth
              value={form.checkOutTime}
              onChange={handleChange}
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
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
