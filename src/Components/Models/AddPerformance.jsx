// src/Components/Models/AddPerformance.jsx
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
import { createPerformance } from "../../DAL/create";
import { updatePerformance } from "../../DAL/edit";
import { fetchEmployees } from "../../DAL/fetch";

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

const statuses = ["Completed", "Pending", "In Progress"];

export default function AddPerformance({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    employeeId: "",
    KPIs: "",
    appraisalDate: "",
    score: "",
    remarks: "",
    status: "In Progress",
  });

  const [employees, setEmployees] = React.useState([]);
  const [errors, setErrors] = React.useState({});
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
    if (Modeltype === "Update" && Modeldata) {
      setForm({
        employeeId: Modeldata?.employeeId?._id || Modeldata?.employeeId || "",
        KPIs: Array.isArray(Modeldata?.KPIs)
          ? Modeldata.KPIs.join(", ")
          : Modeldata?.KPIs || "",
        appraisalDate: Modeldata?.appraisalDate
          ? Modeldata.appraisalDate.split("T")[0]
          : "",
        score: Modeldata?.score || "",
        remarks: Modeldata?.remarks || "",
        status: Modeldata?.status || "In Progress",
      });
      setId(Modeldata?._id || "");
      setErrors({});
    } else {
      setForm({
        employeeId: "",
        KPIs: "",
        appraisalDate: "",
        score: "",
        remarks: "",
        status: "In Progress",
      });
      setId("");
      setErrors({});
    }
  }, [Modeltype, Modeldata]);

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
      const payload = {
        ...form,
        KPIs: form.KPIs.split(",").map((kpi) => kpi.trim()),
      };

      let response;
      if (Modeltype === "Add") {
        response = await createPerformance(payload);
      } else {
        response = await updatePerformance(id, payload);
      }

      if (response.status === 200 || response.status === 201) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Performance saved successfully",
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
          message: response.message || "Validation failed ⚠️",
        });
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error saving performance:", error);
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
          {Modeltype} Performance
        </Typography>

        {Modeltype === "Update" && Modeldata?.performanceId && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Performance ID"
                value={Modeldata.performanceId}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        )}

        <Grid container spacing={2}>
          {/* Employee dropdown */}
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
                  {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* KPIs */}
          <Grid item xs={6}>
            <TextField
              label="KPIs (comma separated)"
              name="KPIs"
              fullWidth
              required
              value={form.KPIs}
              onChange={handleChange}
              error={!!errors.KPIs}
              helperText={errors.KPIs}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Appraisal Date"
              name="appraisalDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={form.appraisalDate}
              onChange={handleChange}
              error={!!errors.appraisalDate}
              helperText={errors.appraisalDate}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="number"
              label="Score"
              name="score"
              fullWidth
              required
              value={form.score}
              onChange={handleChange}
              error={!!errors.score}
              helperText={errors.score}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Remarks"
              name="remarks"
              fullWidth
              multiline
              rows={3}
              value={form.remarks}
              onChange={handleChange}
              error={!!errors.remarks}
              helperText={errors.remarks}
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
              error={!!errors.status}
              helperText={errors.status}
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
