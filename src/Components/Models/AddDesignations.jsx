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
import { createDesignation } from "../../DAL/create";
import { updateDesignation } from "../../DAL/edit";
import { fetchDepartments, fetchDesignations } from "../../DAL/fetch";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "55%",
  maxHeight: "85vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
  "&::-webkit-scrollbar": { display: "none" },
};

const statusOptions = ["Active", "Inactive"];

export default function AddDesignation({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    designationId: "",
    designationName: "",
    departmentId: "",
    archive: false,
    status: "Active",
  });

  const [id, setId] = React.useState("");
  const [departments, setDepartments] = React.useState([]);
  const [errors, setErrors] = React.useState({});

  // Fetch Departments
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const depRes = await fetchDepartments();
        if (depRes?.data) setDepartments(depRes.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchData();
  }, []);

  // Pre-fill when Editing
  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        designationId: Modeldata?.designationId || "",
        designationName: Modeldata?.designationName || "",
        departmentId: Modeldata?.departmentId || "",
        archive: Modeldata?.archive || false,
        status: Modeldata?.status || "Active",
      });
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  // Auto-generate ID for new designation
  React.useEffect(() => {
    const generateId = async () => {
      if (Modeltype === "Add") {
        try {
          const depRes = await fetchDesignations();
          if (depRes?.data?.length > 0) {
            const lastDesignation = depRes.data.sort(
              (a, b) => b.createdAt.localeCompare(a.createdAt)
            )[0];
            const lastNumber = parseInt(
              lastDesignation.designationId?.split("-")[1] || "0"
            );
            const newId = `DES-${(lastNumber + 1)
              .toString()
              .padStart(4, "0")}`;
            setForm((prev) => ({ ...prev, designationId: newId }));
          } else {
            setForm((prev) => ({ ...prev, designationId: "DES-0001" }));
          }
        } catch (error) {
          console.error("Error generating designation ID:", error);
          setForm((prev) => ({ ...prev, designationId: "DES-0001" }));
        }
      }
    };
    generateId();
  }, [Modeltype]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  // Local validation before sending
  const validateForm = () => {
    const newErrors = {};
    if (!form.designationName?.trim())
      newErrors.designationName = "Designation name is required";
    if (!form.departmentId)
      newErrors.departmentId = "Department selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (Modeltype === "Add") {
        response = await createDesignation(form);
      } else {
        response = await updateDesignation(id, form);
      }

      // ✅ Handle missing fields from backend (like Testimonials)
      if (response?.data?.missingFields || response?.missingFields) {
        const missingFields =
          response.data?.missingFields || response.missingFields;
        const backendErrors = {};
        missingFields.forEach((field) => {
          backendErrors[field] = `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} is required`;
        });
        setErrors(backendErrors);
        return;
      }

      if (response?.data) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Designation saved successfully",
        });
        setOpen(false);
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (err) {
      // ✅ Catch backend missingFields from error response
      if (err.response?.data?.missingFields) {
        const missingFields = err.response.data.missingFields;
        const backendErrors = {};
        missingFields.forEach((field) => {
          backendErrors[field] = `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} is required`;
        });
        setErrors(backendErrors);
        return;
      }

      console.error("Error saving designation:", err);
      onResponse({
        messageType: "error",
        message: "Error saving designation",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Designation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Designation ID"
              name="designationId"
              fullWidth
              value={form.designationId}
              onChange={handleChange}
              disabled
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Designation Name"
              name="designationName"
              fullWidth
              value={form.designationName}
              onChange={handleChange}
              error={!!errors.designationName}
              helperText={errors.designationName}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Department"
              name="departmentId"
              fullWidth
              value={form.departmentId}
              onChange={handleChange}
              error={!!errors.departmentId}
              helperText={errors.departmentId}
            >
              {departments.map((dep) => (
                <MenuItem key={dep._id} value={dep._id}>
                  {dep.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} display="flex" alignItems="center" gap={1}>
            <input
              type="checkbox"
              name="archive"
              checked={form.archive}
              onChange={handleChange}
            />
            <Typography>Archive Designation</Typography>
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
              {statusOptions.map((status, index) => (
                <MenuItem key={index} value={status}>
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
