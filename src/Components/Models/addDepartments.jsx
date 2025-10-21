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
import { createnewDepartment } from "../../DAL/create";
import { updateDepartment } from "../../DAL/edit";

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

const statusOptions = ["Active", "Inactive"];

export default function AddDepartment({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    departmentId: "",
    departmentName: "",
    headOfDepartment: "",
    createdDate: "",
    updatedDate: "",
    archiveDepartment: false,
    status: "Active",
  });
  const [id, setId] = React.useState("");

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        departmentId: Modeldata?.departmentId || "",
        departmentName: Modeldata?.departmentName || "",
        headOfDepartment: Modeldata?.headOfDepartment || "",
        createdDate: Modeldata?.createdDate || "",
        updatedDate: Modeldata?.updatedDate || "",
        archiveDepartment: Modeldata?.archiveDepartment || false,
        status: Modeldata?.status || "Active",
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

    let response;
    if (Modeltype === "Add") {
      response = await createnewDepartment(form);
    } else {
      response = await updateDepartment(id, form);
    }

    if (response.status === 201 || response.status === 200) {
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
        <Typography variant="h6">{Modeltype} Department</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Department ID"
              name="departmentId"
              fullWidth
              value={form.departmentId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Department Name"
              name="departmentName"
              fullWidth
              value={form.departmentName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Head of Department"
              name="headOfDepartment"
              fullWidth
              value={form.headOfDepartment}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Created Date"
              name="createdDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.createdDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Updated Date"
              name="updatedDate"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.updatedDate}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} display="flex" alignItems="center" gap={1}>
            <input
              type="checkbox"
              name="archiveDepartment"
              checked={form.archiveDepartment}
              onChange={handleChange}
            />
            <Typography>Archive Department</Typography>
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
