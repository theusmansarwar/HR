// src/Components/Models/AddApplication.jsx
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

import { createApplications } from "../../DAL/create";
import { updateApplications } from "../../DAL/edit";
import { fetchJobs } from "../../DAL/fetch"; // ✅ Added to get job list

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

const statuses = ["Pending", "Shortlisted", "Rejected", "Hired"];

export default function AddApplication({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    jobId: "",
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    resume: null,
    applicationDate: "",
    applicationStatus: "Pending",
    interviewDate: "",
    remarks: "",
  });
  const [id, setId] = React.useState("");
  const [jobs, setJobs] = React.useState([]); // ✅ for dropdown options

  // ✅ Fetch all jobs on mount
  React.useEffect(() => {
    const getJobs = async () => {
      try {
        const res = await fetchJobs();
        if (res?.data) {
          setJobs(res.data);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    getJobs();
  }, []);

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        jobId: Modeldata?.jobId?._id || Modeldata?.jobId || "",
        applicantName: Modeldata?.applicantName || "",
        applicantEmail: Modeldata?.applicantEmail || "",
        applicantPhone: Modeldata?.applicantPhone || "",
        resume: Modeldata?.resume || null,
        applicationDate: Modeldata?.applicationDate || "",
        applicationStatus: Modeldata?.applicationStatus || "Pending",
        interviewDate: Modeldata?.interviewDate || "",
        remarks: Modeldata?.remarks || "",
      });
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setForm((prev) => ({ ...prev, resume: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let response;
    if (Modeltype === "Add") {
      response = await createApplications(form);
    } else {
      response = await updateApplications(id, form);
    }

    if (response?.status === 201 || response?.status === 200) {
      onResponse({
        messageType: "success",
        message: response.message,
      });
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
        <Typography variant="h6">{Modeltype} Application</Typography>
        <Grid container spacing={2} mt={1}>
          {/* ✅ Job dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              label="Select Job"
              name="jobId"
              fullWidth
              value={form.jobId}
              onChange={handleChange}
            >
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>
                  {job.jobTitle}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Applicant Name"
              name="applicantName"
              fullWidth
              value={form.applicantName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Applicant Email"
              name="applicantEmail"
              fullWidth
              value={form.applicantEmail}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Applicant Phone"
              name="applicantPhone"
              fullWidth
              value={form.applicantPhone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <Button variant="contained" component="label" fullWidth>
              Upload Resume
              <input type="file" hidden name="resume" onChange={handleChange} />
            </Button>
            {form.resume && (
              <Button
                variant="text"
                size="small"
                sx={{ mt: 1 }}
                onClick={() =>
                  window.open(
                    typeof form.resume === "string"
                      ? `/uploads/${form.resume}`
                      : URL.createObjectURL(form.resume),
                    "_blank"
                  )
                }
              >
                View Resume
              </Button>
            )}
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Application Date"
              name="applicationDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.applicationDate}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Application Status"
              name="applicationStatus"
              fullWidth
              value={form.applicationStatus}
              onChange={handleChange}
            >
              {statuses.map((status, index) => (
                <MenuItem key={index} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Interview Date"
              name="interviewDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.interviewDate}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Remarks"
              name="remarks"
              fullWidth
              multiline
              rows={2}
              value={form.remarks}
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
