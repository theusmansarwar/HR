import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Modal,
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

export default function AddTraining({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = useState({
    employeeId: "",
    trainingName: "",
    startDate: "",
    endDate: "",
    certificate: null,
    status: "Pending",
    archive: false,
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [id, setId] = useState("");

  useEffect(() => {
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

  useEffect(() => {
    if (Modeldata && Modeltype === "Update") {
      setForm({
        employeeId: Modeldata.employeeId?._id || Modeldata.employeeId || "",
        trainingName: Modeldata.trainingName || "",
        startDate: Modeldata.startDate
          ? Modeldata.startDate.split("T")[0]
          : "",
        endDate: Modeldata.endDate ? Modeldata.endDate.split("T")[0] : "",
        certificate: Modeldata.certificate || null,
        status: Modeldata.status || "Pending",
        archive: Modeldata.archive || false,
      });
      setId(Modeldata._id || "");
      setErrors({});
    } else if (Modeltype === "Add") {
      setForm({
        employeeId: "",
        trainingName: "",
        startDate: "",
        endDate: "",
        certificate: null,
        status: "Pending",
        archive: false,
      });
      setId("");
      setErrors({});
    }
  }, [Modeldata, Modeltype, open]);

  const handleClose = () => {
    setOpen(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
    setErrors({});
    try {
      let response;
      if (Modeltype === "Add") {
        response = await createTraining(form);
      } else {
        response = await updateTraining(id, form);
      }

      if (response.status === 200 || response.status === 201) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Training saved successfully",
        });
        setOpen(false);
      }
      else if (response.status === 400 && response.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
        onResponse({
          messageType: "error",
          message: response.message || "Validation failed",
        });
      }
      else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error saving training:", error);
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
          {Modeltype} Training
        </Typography>

        {Modeldata && Modeldata.trainingId && (
          <TextField
            label="Training ID"
            fullWidth
            disabled
            value={Modeldata.trainingId}
            sx={{ mb: 2 }}
          />
        )}

        <Grid container spacing={2}>
          {/* Employee */}
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
                  {emp.firstName} {emp.lastName} ({emp.email})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Training Name */}
          <Grid item xs={6}>
            <TextField
              label="Training Name"
              name="trainingName"
              fullWidth
              required
              value={form.trainingName}
              onChange={handleChange}
              error={!!errors.trainingName}
              helperText={errors.trainingName}
            />
          </Grid>

          {/* Start Date */}
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Start Date"
              name="startDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={form.startDate}
              onChange={handleChange}
              error={!!errors.startDate}
              helperText={errors.startDate}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={6}>
            <TextField
              type="date"
              label="End Date"
              name="endDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={form.endDate}
              onChange={handleChange}
              error={!!errors.endDate}
              helperText={errors.endDate}
            />
          </Grid>

          {/* Status */}
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
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

           
           

          {/* Certificate */}
          <Grid item xs={6}>
            <Button variant="contained" component="label" fullWidth>
              Upload Certificate
              <input
                type="file"
                hidden
                name="certificate"
                onChange={handleChange}
              />
            </Button>
            {errors.certificate && (
              <Typography color="error" variant="caption">
                {errors.certificate}
              </Typography>
            )}
          </Grid>

          {form.certificate && (
            <Grid item xs={6}>
              <Button
                variant="text"
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
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button onClick={handleClose} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {Modeltype === "Add" ? "Create" : "Update"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
