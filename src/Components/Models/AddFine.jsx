// src/Components/Models/AddFine.jsx
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
import { createFines } from "../../DAL/create";
import { updateFines } from "../../DAL/edit";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

const statusOptions = ["Paid", "Unpaid"];

export default function AddFine({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    fineId: "",
    employeeId: "",
    fineType: "",
    fineAmount: "",
    fineDate: "",
    description: "",
    status: "Unpaid",
    archive: false,
  });

  const [id, setId] = React.useState("");

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        fineId: Modeldata?.fineId || "",
        employeeId: Modeldata?.employeeId || "",
        fineType: Modeldata?.fineType || "",
        fineAmount: Modeldata?.fineAmount || "",
        fineDate: Modeldata?.fineDate || "",
        description: Modeldata?.description || "",
        status: Modeldata?.status || "Unpaid",
        archive: Modeldata?.archive || false,
      });
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      let payload = { ...form };

      // ✅ Auto-generate fineId when adding
      if (Modeltype === "Add") {
        payload.fineId = `FINE-${Date.now()}`;
        response = await createFines(payload);
      } else {
        response = await updateFines(id, payload);
      }

      if (response?.data) {
        onSave(response.data);

        onResponse({
          messageType: "success",
          message: response.message || "Fine saved successfully",
        });
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }

      setOpen(false);
    } catch (err) {
      console.error("Error saving fine:", err);
      onResponse({
        messageType: "error",
        message: "Error saving fine",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6">{Modeltype} Fine</Typography>
        <Grid container spacing={2} mt={1}>
          {/* Fine ID */}
          <Grid item xs={6}>
            <TextField
              label="Fine ID"
              name="fineId"
              fullWidth
              value={form.fineId}
              onChange={handleChange}
              disabled={Modeltype === "Add"} // prevent editing auto ID
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Employee ID"
              name="employeeId"
              fullWidth
              value={form.employeeId}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Fine Type"
              name="fineType"
              fullWidth
              value={form.fineType}
              onChange={handleChange}
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
              {statusOptions.map((status, index) => (
                <MenuItem key={index} value={status}>
                  {status}
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
            <Typography>Archive Fine</Typography>
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
