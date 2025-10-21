// src/Components/Models/AddPerformance.jsx
import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
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

export default function AddPerformance({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
  onSave,
}) {
  const [form, setForm] = React.useState({
    employeeId: "",
    KPIs: "",
    appraisalDate: "",
    score: "",
    remarks: "",
  });

  const [id, setId] = React.useState("");
  const [employees, setEmployees] = React.useState([]);

  // Fetch employees for dropdown
  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees();
        if (res?.data) setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees for performance form:", err);
      }
    };
    loadEmployees();
  }, []);

  // Populate form when editing
  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        employeeId: Modeldata?.employeeId || "",
        KPIs: Modeldata?.KPIs || "",
        appraisalDate: Modeldata?.appraisalDate || "",
        score: Modeldata?.score || "",
        remarks: Modeldata?.remarks || "",
      });
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    let response;
    if (Modeltype === "Add") {
      response = await createPerformance(formData, true);
    } else {
      response = await updatePerformance(id, formData, true);
    }

    if (response?.status === 201 || response?.status === 200) {
      onResponse({
        messageType: "success",
        message: response.message,
      });
      if (response.data) onSave(response.data);
    } else {
      onResponse({
        messageType: "error",
        message: response.message,
      });
    }

    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Performance
        </Typography>

        <Grid container spacing={2}>
          {/* Employee dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              label="Employee"
              name="employeeId"
              fullWidth
              value={form.employeeId}
              onChange={handleChange}
              SelectProps={{ native: true }}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </TextField>
          </Grid>

          {/* KPIs */}
          <Grid item xs={6}>
            <TextField
              label="KPIs"
              name="KPIs"
              fullWidth
              value={form.KPIs}
              onChange={handleChange}
            />
          </Grid>

          {/* Appraisal Date */}
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Appraisal Date"
              name="appraisalDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.appraisalDate}
              onChange={handleChange}
            />
          </Grid>

          {/* Score */}
          <Grid item xs={6}>
            <TextField
              type="number"
              label="Score"
              name="score"
              fullWidth
              value={form.score}
              onChange={handleChange}
            />
          </Grid>

          {/* Remarks */}
          <Grid item xs={12}>
            <TextField
              label="Remarks"
              name="remarks"
              fullWidth
              multiline
              rows={3}
              value={form.remarks}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Buttons */}
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
