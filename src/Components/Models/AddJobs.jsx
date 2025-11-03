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
import { createJobs } from "../../DAL/create";
import { updateJob } from "../../DAL/edit";
import { fetchDepartments, fetchDesignations } from "../../DAL/fetch";

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

const statuses = ["Active", "Inactive", "Closed"];

export default function AddJobs({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    jobTitle: "",
    jobDescription: "",
    departmentId: "",
    designationId: "",
    status: "Active",
    postingDate: "",
    expiryDate: "",
  });

  const [errors, setErrors] = React.useState({});
  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [id, setId] = React.useState("");

  React.useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const depRes = await fetchDepartments();
        const desRes = await fetchDesignations();

        setDepartments(depRes?.data || []);
        setDesignations(desRes?.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    loadDropdownData();
  }, []);

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        jobTitle: Modeldata?.jobTitle || "",
        jobDescription: Modeldata?.jobDescription || "",
        departmentId: Modeldata?.departmentId?._id || "",
        designationId: Modeldata?.designationId?._id || "",
        status: Modeldata?.status || "Active",
        postingDate: Modeldata?.postingDate
          ? Modeldata.postingDate.split("T")[0]
          : "",
        expiryDate: Modeldata?.expiryDate
          ? Modeldata.expiryDate.split("T")[0]
          : "",
      });
      setId(Modeldata?._id || "");
    } else {
      setForm({
        jobDescription: "",
        departmentId: "",
        designationId: "",
        status: "Active",
        postingDate: "",
        expiryDate: "",
      });
      setId("");
    }
  }, [Modeldata]);

const handleClose = () => {
  setErrors({});
  setForm({
    jobDescription: "",
    departmentId: "",
    designationId: "",
    postedBy: "",
    status: "Active",
    postingDate: "",
    expiryDate: "",
  });
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
        response = await createJobs(payload);
      } else {
        response = await updateJob(id, payload);
      }

      if (response?.status === 400 && response?.missingFields) {
        const newErrors = {};
        response.missingFields.forEach((f) => {
          newErrors[f.name] = f.message;
        });
        setErrors(newErrors);
        return;
      }

      if (response?.status === 200 || response?.status === 201) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Job saved successfully",
        });
        setOpen(false);
      } else {
        onResponse({
          messageType: "error",
          message: response?.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error saving job:", error);
      onResponse({
        messageType: "error",
        message: "Server error while saving job",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2} textAlign="left">
          {Modeltype} Job
        </Typography>

        {Modeldata && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField
                label="Job ID"
                value={Modeldata.jobId}
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
              label="Select Department"
              name="departmentId"
              fullWidth
              required
              value={form.departmentId}
              onChange={handleChange}
              error={!!errors.departmentId}
              helperText={errors.departmentId}
            >
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((dep) => (
                <MenuItem key={dep._id} value={dep._id}>
                  {dep.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Select Designation"
              name="designationId"
              fullWidth
              required
              value={form.designationId}
              onChange={handleChange}
              error={!!errors.designationId}
              helperText={errors.designationId}
            >
              <MenuItem value="">Select Designation</MenuItem>
              {designations.map((des) => (
                <MenuItem key={des._id} value={des._id}>
                  {des.designationName}
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
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Posting Date"
              name="postingDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={form.postingDate}
              onChange={handleChange}
              error={!!errors.postingDate}
              helperText={errors.postingDate}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Expiry Date"
              name="expiryDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={form.expiryDate}
              onChange={handleChange}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Job Description"
              name="jobDescription"
              fullWidth
              required
              value={form.jobDescription}
              onChange={handleChange}
              multiline
              rows={4}
              error={!!errors.jobDescription}
              helperText={errors.jobDescription}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button onClick={handleClose} variant="outlined" color="error">
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
