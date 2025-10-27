import React, { useState, useEffect } from "react";
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
import { fetchJobs } from "../../DAL/fetch";

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
  modalType, 
  modalData,
  onResponse,
  onSave,
}) {
  const [form, setForm] = useState({
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
  const [id, setId] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const getJobs = async () => {
      try {
        const res = await fetchJobs();
        if (res?.data) setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    getJobs();
  }, []);

  useEffect(() => {
    if (modalType === "Add") {
      setForm({
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
      setId("");
    } else if (modalType === "Update" && modalData) {
      const { jobId, applicationDate, interviewDate, ...rest } = modalData;

      setForm({
        jobId: jobId?._id || jobId || "",  // Ensure correct jobId is set
        applicationDate: applicationDate ? applicationDate.split("T")[0] : "",  // Ensure correct date format
        interviewDate: interviewDate ? interviewDate.split("T")[0] : "",  // Ensure correct date format
        ...rest,  // Spread the remaining values
      });
      setId(modalData?._id || "");
    }
  }, [modalType, modalData]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume" && files.length > 0) {
      setForm({ ...form, resume: files[0].name }); // store only file name
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modalType === "Add") {
        response = await createApplications(form);
      } else if (modalType === "Update") {
        response = await updateApplications(id, form);
      }

      if (response?.status === 201 || response?.status === 200) {
        onResponse({ messageType: "success", message: response.message });
        if (onSave) onSave(response.data);
      } else {
        onResponse({ messageType: "error", message: response.message });
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      onResponse({ messageType: "error", message: err.message });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6">{modalType} Application</Typography>
        <Grid container spacing={2} mt={1}>
          {/* Job dropdown */}
          <Grid item xs={6}>
            <TextField
              select
              label="Select Job"
              name="jobId"
              fullWidth
              value={form.jobId}
              onChange={handleChange}
            >
              {jobs.map((job) => {
                return (
                  <MenuItem key={job._id} value={job._id}>
                    {job.jobTitle}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>

          {/* Applicant Name */}
          <Grid item xs={6}>
            <TextField
              label="Applicant Name"
              name="applicantName"
              fullWidth
              value={form.applicantName}
              onChange={handleChange}
            />
          </Grid>

          {/* Applicant Email */}
          <Grid item xs={6}>
            <TextField
              label="Applicant Email"
              name="applicantEmail"
              fullWidth
              value={form.applicantEmail}
              onChange={handleChange}
            />
          </Grid>

          {/* Applicant Phone */}
          <Grid item xs={6}>
            <TextField
              label="Applicant Phone"
              name="applicantPhone"
              fullWidth
              value={form.applicantPhone}
              onChange={handleChange}
            />
          </Grid>

          {/* Resume Upload */}
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

          {/* Application Date */}
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

          {/* Status */}
          <Grid item xs={6}>
            <TextField
              select
              label="Application Status"
              name="applicationStatus"
              fullWidth
              value={form.applicationStatus}
              onChange={handleChange}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Interview Date */}
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

          {/* Remarks */}
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

        {/* Buttons */}
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
