import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
  Grid,
  FormHelperText,
} from "@mui/material";
import { createFines } from "../../DAL/create";
import { updateFines } from "../../DAL/edit";
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

const statuses = ["Paid", "Unpaid"];

export default function AddFine({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    employeeId: "",
    fineType: "",
    fineAmount: "",
    fineDate: "",
    description: "",
    status: "Unpaid",
  });

  const [errors, setErrors] = React.useState({});
  const [employees, setEmployees] = React.useState([]);
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
        fineType: Modeldata?.fineType || "",
        fineAmount: Modeldata?.fineAmount || "",
        fineDate: Modeldata?.fineDate ? Modeldata.fineDate.split("T")[0] : "",
        description: Modeldata?.description || "",
        status: Modeldata?.status || "Unpaid",
      });
      setId(Modeldata?._id || "");
    } else {
      setForm({
        employeeId: "",
        fineType: "",
        fineAmount: "",
        fineDate: "",
        description: "",
        status: "Unpaid",
      });
      setId("");
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
      const payload = { ...form };
      let response;

      if (Modeltype === "Add") {
        response = await createFines(payload);
      } else {
        response = await updateFines(id, payload);
      }

      if (response.status === 200 || response.status === 201) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Fine saved successfully",
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
      console.error("Error saving fine:", error);
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
          {Modeltype} Fine
        </Typography>

        {Modeldata && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Fine ID"
                value={Modeldata.fineId}
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

          <Grid item xs={6}>
            <TextField
              label="Fine Type"
              name="fineType"
              fullWidth
              value={form.fineType}
              onChange={handleChange}
              error={!!errors.fineType}
              helperText={errors.fineType}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Fine Amount"
              name="fineAmount"
              type="number"
              fullWidth
              value={form.fineAmount}
              onChange={handleChange}
              error={!!errors.fineAmount}
              helperText={errors.fineAmount}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Fine Date"
              name="fineDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.fineDate}
              onChange={handleChange}
              error={!!errors.fineDate}
              helperText={errors.fineDate}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
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
