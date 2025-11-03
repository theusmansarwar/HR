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
  const [errors, setErrors] = useState({}); 
  const [resumeFileName, setResumeFileName] = useState(""); // ✅ NEW: Track filename separately

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
      setErrors({});
      setResumeFileName(""); // ✅ Reset filename
      return;
    }

    if (modalType === "Update" && modalData && jobs.length > 0) {
      const normalizedJobId = modalData.jobId?._id
        ? String(modalData.jobId._id)
        : String(modalData.jobId || "");

      const newForm = {
        ...modalData,
        jobId: normalizedJobId,
        applicationDate: modalData.applicationDate
          ? modalData.applicationDate.split("T")[0]
          : "",
        interviewDate: modalData.interviewDate
          ? modalData.interviewDate.split("T")[0]
          : "",
      };

      setForm(newForm);
      setId(modalData._id || "");
      setErrors({});
      setResumeFileName(modalData.resume || ""); // ✅ Set existing resume name
    }
  }, [modalType, modalData, jobs]);

  const handleClose = () => setOpen(false);

  // ✅ FIXED: Handle file uploads properly
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "resume" && files && files.length > 0) {
      // Store the actual File object, not just the name
      setForm({ ...form, resume: files[0] });
      setResumeFileName(files[0].name);
      setErrors({ ...errors, resume: "" });
    } else {
      setForm({ ...form, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ✅ FIXED: Use FormData to send files
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData to properly send files
      const formData = new FormData();
      formData.append("jobId", form.jobId);
      formData.append("applicantName", form.applicantName);
      formData.append("applicantEmail", form.applicantEmail);
      formData.append("applicantPhone", form.applicantPhone);
      formData.append("applicationDate", form.applicationDate);
      formData.append("applicationStatus", form.applicationStatus);
      formData.append("interviewDate", form.interviewDate);
      formData.append("remarks", form.remarks);
      
      // Only append resume if it's a File object (new upload)
      if (form.resume instanceof File) {
        formData.append("resume", form.resume);
      }

      let response;
      if (modalType === "Add") {
        response = await createApplications(formData);
      } else if (modalType === "Update") {
        response = await updateApplications(id, formData);
      }

      if (response?.status === 201 || response?.status === 200) {
        onResponse({ messageType: "success", message: response.message });
        if (onSave) onSave(response.data);
        setOpen(false);
      } 
      // Handle backend validation errors
      else if (response?.status === 400 && response?.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
        onResponse({ messageType: "error", message: response.message });
      } 
      else {
        onResponse({ messageType: "error", message: response?.message || "Unknown error" });
      }
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
              error={!!errors.jobId}
              helperText={errors.jobId}
            >
              {jobs.map((job) => (
                <MenuItem key={job._id} value={String(job._id)}>
                  {job.jobTitle}
                </MenuItem>
              ))}
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
              error={!!errors.applicantName}
              helperText={errors.applicantName}
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
              error={!!errors.applicantEmail}
              helperText={errors.applicantEmail}
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
              error={!!errors.applicantPhone}
              helperText={errors.applicantPhone}
            />
          </Grid>

          {/* ✅ FIXED: Resume Upload with proper error display */}
          <Grid item xs={6}>
            <Button variant="contained" component="label" fullWidth>
              Upload Resume
              <input 
                type="file" 
                hidden 
                name="resume" 
                onChange={handleChange}
              />
            </Button>
            {resumeFileName && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                Selected: {resumeFileName}
              </Typography>
            )}
            {form.resume && typeof form.resume === "string" && (
              <Button
                variant="text"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => window.open(`/uploads/${form.resume}`, "_blank")}
              >
                View Current Resume
              </Button>
            )}
            {/* ✅ Error message displayed in red below the button */}
            {errors.resume && (
              <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                {errors.resume}
              </Typography>
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
              error={!!errors.applicationDate}
              helperText={errors.applicationDate}
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
              error={!!errors.applicationStatus}
              helperText={errors.applicationStatus}
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
              error={!!errors.interviewDate}
              helperText={errors.interviewDate}
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
              error={!!errors.remarks}
              helperText={errors.remarks}
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