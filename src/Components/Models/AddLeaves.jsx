import React, { useState, useEffect } from "react";
import { Box, Button, Typography, TextField, MenuItem, Grid, Modal } from "@mui/material";
import { createLeaves } from "../../DAL/create";
import { updateLeave } from "../../DAL/edit";
import { fetchEmployees } from "../../DAL/fetch";

const leaveTypes = ["Casual", "Sick", "Annual", "Maternity", "Paternity"];
const leaveStatus = ["Pending", "Approved", "Rejected"];

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

export default function AddLeaves({ open, setOpen, Modeltype, Modeldata, onSave, onResponse }) {
  const [form, setForm] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    status: "Pending",
    reason: "",
    attachmentLinks: [],
  });
  const [employees, setEmployees] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees();
        setEmployees(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    if (Modeldata) {
      setForm({
        employeeId: Modeldata.employeeId?._id || Modeldata.employeeId || "",
        leaveType: Modeldata.leaveType || "",
        startDate: Modeldata.startDate ? Modeldata.startDate.split("T")[0] : "",
        endDate: Modeldata.endDate ? Modeldata.endDate.split("T")[0] : "",
        status: Modeldata.status || "Pending",
        reason: Modeldata.reason || "",
        attachmentLinks: Modeldata.attachmentLinks || [],
      });
      setId(Modeldata._id || "");
    } else {
      setForm({
        employeeId: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        status: "Pending",
        reason: "",
        attachmentLinks: [],
      });
      setId("");
    }
  }, [Modeldata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (Modeltype === "Add") {
        response = await createLeaves(form);
      } else {
        response = await updateLeave(id, form);
      }

      if (response?.data) {
        onSave(response.data);
        onResponse({ message: `${Modeltype} Leave successfully!` });
        setOpen(false);
      } else {
        onResponse({ message: "Failed to save leave" });
      }
    } catch (err) {
      console.error(err);
      onResponse({ message: "Error saving leave" });
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {Modeltype} Leave
        </Typography>

        {Modeldata && (
          <TextField label="Leave ID" fullWidth disabled value={Modeldata.leaveId} sx={{ mb: 2 }} />
        )}

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              select
              label="Employee"
              name="employeeId"
              fullWidth
              required
              value={form.employeeId}
              onChange={handleChange}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.email})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Leave Type"
              name="leaveType"
              fullWidth
              required
              value={form.leaveType}
              onChange={handleChange}
            >
              {leaveTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>

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
            />
          </Grid>

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
              {leaveStatus.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Reason"
              name="reason"
              fullWidth
              value={form.reason}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button onClick={() => setOpen(false)} variant="contained" color="error">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
        </Box>
      </Box>
    </Modal>
  );
}
