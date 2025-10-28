import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { createUser } from "../../DAL/create";
import { updateUser } from "../../DAL/edit";
import { getRoles } from "../../DAL/fetch";

const AddUser = ({ open, setOpen, modalType, modalData, onSave, onResponse }) => {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "Active",
  });
  const [errors, setErrors] = React.useState({});
  const [allRoles, setAllRoles] = React.useState([]);
  const [id, setId] = React.useState("");

  // ✅ Fetch roles when modal opens
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoles();
        setAllRoles(res?.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    if (open) fetchRoles();
  }, [open]);

  // ✅ Autofill on edit
  React.useEffect(() => {
    if (modalType === "Edit" && modalData && Object.keys(modalData).length > 0) {
      setForm({
        name: modalData.name || "",
        email: modalData.email || "",
        password: "",
        role: modalData.role || "",
        status: modalData.status || "Active",
      });
      setId(modalData._id || "");
    } else if (modalType === "Add") {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        status: "Active",
      });
      setId("");
    }
  }, [modalType, modalData]);

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear field error
  };

  const handleClose = () => {
    setErrors({});
    setOpen(false);
  };

  // ✅ Backend-driven form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = { ...form };
      let response;

      if (modalType === "Add") {
        response = await createUser(payload);
      } else {
        response = await updateUser(id, payload);
      }

      console.log("Response:", response);

      const resData = response?.data || response; // support both formats

      // ✅ Success case
      if (resData.status === 200 || resData.status === 201) {
        if (typeof onSave === "function") onSave(resData.data);
        if (typeof onResponse === "function") {
          onResponse({
            messageType: "success",
            message: resData.message || "User saved successfully!",
          });
        }
        setOpen(false);
        return;
      }

      // ✅ Validation / Missing fields case
      if (resData.status === 400 && Array.isArray(resData.missingFields)) {
        const fieldErrors = {};
        resData.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);

        if (typeof onResponse === "function") {
          onResponse({
            messageType: "error",
            message: resData.message || "Please fill all required fields.",
          });
        }
        return;
      }

      // ✅ Generic error case
      if (typeof onResponse === "function") {
        onResponse({
          messageType: "error",
          message: resData.message || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);

      // ✅ Backend-driven error catch (still structured)
      const resData = error?.response?.data;
      if (resData?.missingFields) {
        const fieldErrors = {};
        resData.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
      }

      if (typeof onResponse === "function") {
        onResponse({
          messageType: "error",
          message: resData?.message || "Internal Server Error",
        });
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{modalType} User</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {modalType === "Edit" && id && (
          <TextField label="User ID" value={id} fullWidth disabled />
        )}

        <TextField
          label="Name"
          name="name"
          fullWidth
          value={form.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          label="Email"
          name="email"
          fullWidth
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />

        {modalType === "Add" && (
          <TextField
            type="password"
            label="Password"
            name="password"
            fullWidth
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
        )}

        <TextField
          select
          label="Assign Role"
          name="role"
          fullWidth
          value={form.role}
          onChange={handleChange}
          error={!!errors.role}
          helperText={errors.role}
        >
          <MenuItem value="">Select Role</MenuItem>
          {allRoles.map((r) => (
            <MenuItem key={r._id} value={r.name}>
              {r.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          name="status"
          fullWidth
          value={form.status}
          onChange={handleChange}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="error" variant="contained">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {modalType === "Add" ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUser;
