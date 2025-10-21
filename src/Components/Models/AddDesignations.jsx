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
import { fetchDepartments } from "../../DAL/fetch"; // Add this import

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
    createdDate: "",
    updatedDate: "",
    archive: false,
    status: "Active",
  });
  const [id, setId] = React.useState("");
  const [departments, setDepartments] = React.useState([]);

  // Fetch departments from API
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

  React.useEffect(() => {
    if (Modeldata) {
      setForm({
        designationId: Modeldata?.designationId || "",
        designationName: Modeldata?.designationName || "",
        departmentId: Modeldata?.departmentId || "",
        createdDate: Modeldata?.createdDate || "",
        updatedDate: Modeldata?.updatedDate || "",
        archive: Modeldata?.archive || false,
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
    try {
      let response;

      if (Modeltype === "Add") {
        response = await createDesignation(form);
      } else {
        response = await updateDesignation(id, form);
      }

      if (response?.data) {
        onSave(response.data);

        onResponse({
          messageType: "success",
          message: response.message || "Saved successfully",
        });
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }

      setOpen(false);
    } catch (err) {
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
        <Typography variant="h6">{Modeltype} Designation</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Designation ID"
              name="designationId"
              fullWidth
              value={form.designationId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Designation Name"
              name="designationName"
              fullWidth
              value={form.designationName}
              onChange={handleChange}
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
            >
              {departments.map((dep) => (
                <MenuItem key={dep._id} value={dep._id}>
                  {dep.departmentName}
                </MenuItem>
              ))}
            </TextField>
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
