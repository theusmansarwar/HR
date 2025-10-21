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
    socialMediaLinks: "",
  });

  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [id, setId] = React.useState("");

  // ✅ Fetch dropdown data on mount
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
        socialMediaLinks: Modeldata?.socialMediaLinks?.join(", ") || "",
      });
      setId(Modeldata?._id || "");
    } else {
      setForm({
        jobTitle: "",
        jobDescription: "",
        departmentId: "",
        designationId: "",
        status: "Active",
        postingDate: "",
        expiryDate: "",
        socialMediaLinks: "",
      });
      setId("");
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        socialMediaLinks: form.socialMediaLinks
          ? form.socialMediaLinks.split(",").map((link) => link.trim())
          : [],
      };

      let response;
      if (Modeltype === "Add") {
        response = await createJobs(payload);
      } else {
        response = await updateJob(id, payload);
      }

      if (response?.data) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Job saved successfully",
        });
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }

      setOpen(false);
    } catch (error) {
      console.error("Error saving job:", error);
      onResponse({
        messageType: "error",
        message: "Error saving job",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Job
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Job Title"
              name="jobTitle"
              fullWidth
              required
              value={form.jobTitle}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Job Description"
              name="jobDescription"
              fullWidth
              required
              value={form.jobDescription}
              onChange={handleChange}
            />
          </Grid>

          {/* ✅ Department Dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              label="Select Department"
              name="departmentId"
              fullWidth
              required
              value={form.departmentId}
              onChange={handleChange}
            >
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((dep) => (
                <MenuItem key={dep._id} value={dep._id}>
                  {dep.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ✅ Designation Dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              label="Select Designation"
              name="designationId"
              fullWidth
              required
              value={form.designationId}
              onChange={handleChange}
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
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Social Media Links (comma separated)"
              name="socialMediaLinks"
              fullWidth
              value={form.socialMediaLinks}
              onChange={handleChange}
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
