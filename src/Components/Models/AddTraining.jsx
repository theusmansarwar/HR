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

export default function AddTraining({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
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
  const [id, setId] = React.useState("");

  // ✅ Fetch employees once
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

  // ✅ Prefill when updating
  React.useEffect(() => {
    if (Modeltype === "Update" && Modeldata) {
      setForm({
        employeeId: Modeldata?.employeeId?._id || "",
        trainingName: Modeldata?.trainingName || "",
        startDate: Modeldata?.startDate
          ? Modeldata.startDate.split("T")[0]
          : "",
        endDate: Modeldata?.endDate ? Modeldata.endDate.split("T")[0] : "",
        certificate: Modeldata?.certificate || null,
        status: Modeldata?.status || "Pending",
        archive: Modeldata?.archive || false,
      });
      setId(Modeldata?._id || "");
    }
  }, [Modeldata, Modeltype]);

  // ✅ Reset when opening for Add
  React.useEffect(() => {
    if (open && Modeltype === "Add") {
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
    }
  }, [open, Modeltype]);

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
        response = await updateTraining(id, form);
      }

      if (response?.data) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: `${Modeltype} Training Successfully!`,
        });
      } else {
        onResponse({
          messageType: "error",
          message: "Failed to save training",
        });
      }

      setOpen(false);
    } catch (error) {
      console.error("Training submit error:", error);
      onResponse({
        messageType: "error",
        message: "Error while saving training",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Training
        </Typography>

        {Modeldata && Modeltype === "Update" && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Training ID"
                value={Modeldata._id}
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

          {/* Training Name */}
          <Grid item xs={6}>
            <TextField
              label="Training Name"
              name="trainingName"
              fullWidth
              required
              value={form.trainingName}
              onChange={handleChange}
            />
          </Grid>

          {/* Start Date */}
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Start Date"
              name="startDate"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.startDate}
              onChange={handleChange}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={6}>
            <TextField
              type="date"
              label="End Date"
              name="endDate"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.endDate}
              onChange={handleChange}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={6}>
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              required
              value={form.status}
              onChange={handleChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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

          {/* Certificate Upload */}
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
