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

import { createTraining } from "../../DAL/create";
import { updateTraining } from "../../DAL/edit";
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

const statusOptions = ["Pending", "In Progress", "Completed"];

export default function AddTraining({ open, setOpen, Modeltype, Modeldata, onResponse, onSave }) {
  const [form, setForm] = React.useState({
    employeeId: "",
    trainingName: "",
    startDate: "",
    endDate: "",
    certificate: null,
    status: "Pending",
    archive: false,
  });

  const [employees, setEmployees] = React.useState([]);

  React.useEffect(() => {
    // Fetch employees from API
    const getEmployees = async () => {
      try {
       const res = await fetchEmployees();
      setEmployees(res?.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    getEmployees();
  }, []);

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        employeeId: Modeldata?.employeeId || "",
        trainingName: Modeldata?.trainingName || "",
        startDate: Modeldata?.startDate || "",
        endDate: Modeldata?.endDate || "",
        certificate: Modeldata?.certificate || null,
        status: Modeldata?.status || "Pending",
        archive: Modeldata?.archive || false,
        _id: Modeldata?._id || null,
      });
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificate") {
      setForm((prev) => ({ ...prev, certificate: files[0] }));
    } else if (name === "archive") {
      setForm((prev) => ({ ...prev, archive: value === "True" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  

    try {
      let response;

      if (Modeltype === "Add") {
        response = await createTraining(form);
      } else {
        response = await updateTraining(form._id, form);
      }

      if (response?.status === 200 || response?.status === 201) {
        if (onSave) onSave(response.data || form);
        if (onResponse)
          onResponse({ message: `${Modeltype} Training Successfully!` });
        setOpen(false); 
      } else {
        if (onResponse) onResponse({ message: "Failed to save training" });
      }
    } catch (error) {
      console.error("Training submit error:", error);
      if (onResponse) onResponse({ message: "Error while saving training" });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6">{Modeltype} Training</Typography>
        <Grid container spacing={2} mt={1}>
          {/* Employees Dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              margin="dense"
              label="Employee"
              name="employeeId"
              fullWidth
              value={form.employeeId}
              onChange={handleChange}
            >
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.employeeId} - {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Loading employees...</MenuItem>
              )}
            </TextField>
          </Grid>

          {/* Training Name */}
          <Grid item xs={6}>
            <TextField
              label="Training Name"
              name="trainingName"
              fullWidth
              value={form.trainingName}
              onChange={handleChange}
            />
          </Grid>

          {/* Start & End Dates */}
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.startDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.endDate}
              onChange={handleChange}
            />
          </Grid>

          {/* Archive */}
          <Grid item xs={6}>
            <TextField
              select
              label="Archive"
              name="archive"
              fullWidth
              value={form.archive ? "True" : "False"}
              onChange={handleChange}
            >
              <MenuItem value="False">False</MenuItem>
              <MenuItem value="True">True</MenuItem>
            </TextField>
          </Grid>

          {/* Certificate */}
          <Grid item xs={6}>
            <Button variant="contained" component="label" fullWidth>
              Upload Certificate
              <input type="file" hidden name="certificate" onChange={handleChange} />
            </Button>
          </Grid>
          {form.certificate && (
            <Grid item xs={6}>
              <Button
                variant="text"
                size="small"
                onClick={() =>
                  window.open(
                    typeof form.certificate === "string"
                      ? `/uploads/${form.certificate}`
                      : URL.createObjectURL(form.certificate),
                    "_blank"
                  )
                }
              >
                View Certificate
              </Button>
            </Grid>
          )}

          {/* Status */}
          <Grid item xs={6}>
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={form.status}
              onChange={handleChange}
            >
              {statusOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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
