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
import { useAlert } from "../Alert/AlertContext"; // ✅ Added this import

const AddUser = ({ open, setOpen, modalType, modalData, onSave, onResponse }) => {
  const { showAlert } = useAlert(); // ✅ Using useAlert hook
  
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
  const [loading, setLoading] = React.useState(false);

  // Fetch roles when dialog opens
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoles();
        setAllRoles(res?.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        showAlert("error", "Failed to fetch roles");
      }
    };
    
    if (open) {
      fetchRoles();
      setErrors({});
    }
  }, [open]);

  // Populate form data based on modalType
  React.useEffect(() => {
    if (!open) return;

    if ((modalType === "Edit" || modalType === "Update") && modalData) {
      if (allRoles.length === 0) return;

      const userId = modalData._id || modalData.id || modalData.userId || "";
      
      setForm({
        name: modalData.name || "",
        email: modalData.email || "",
        password: "",
        role: modalData.role || "",
        status: modalData.status || "Active",
      });
      setId(userId);
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
  }, [modalType, modalData, allRoles, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClose = () => {
    setErrors({});
    setLoading(false);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      status: "Active",
    });
    setId("");
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((modalType === "Edit" || modalType === "Update") && !id) {
      showAlert("error", "User ID is missing. Cannot update user.");
      if (typeof onResponse === "function") {
        onResponse({
          messageType: "error",
          message: "User ID is missing. Cannot update user.",
        });
      }
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      const payload = { ...form };
      
      if (modalType === "Edit" || modalType === "Update") {
        delete payload.password;
      }

      let response;

      if (modalType === "Add") {
        response = await createUser(payload);
      } else {
        response = await updateUser(id, payload);
      }

      console.log("✅ API Response:", response);

      // Success handling
      if (response?.status === 200 || response?.status === 201) {
        const successMessage = response.message || "User saved successfully!";
        
        // ✅ Show alert notification
        showAlert("success", successMessage);
        if (typeof onResponse === "function") {
          onResponse({
            messageType: "success",
            message: successMessage,
          });
        }
        
        // Call onSave to refresh data
        if (typeof onSave === "function") {
          await onSave(response.data);
        }
        
        handleClose();
        return;
      }

      // Handle validation errors (400)
      if (response?.status === 400 && Array.isArray(response?.missingFields)) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);

        const errorMessage = response.message || "Please fill all required fields.";
        showAlert("error", errorMessage);

        if (typeof onResponse === "function") {
          onResponse({
            messageType: "error",
            message: errorMessage,
          });
        }
        setLoading(false);
        return;
      }

      // Other errors
      const errorMessage = response?.message || "Something went wrong!";
      showAlert("error", errorMessage);
      
      if (typeof onResponse === "function") {
        onResponse({
          messageType: "error",
          message: errorMessage,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);

      if (error?.missingFields) {
        const fieldErrors = {};
        error.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
      }

      const errorMessage = error?.message || "Internal Server Error";
      showAlert("error", errorMessage);

      if (typeof onResponse === "function") {
        onResponse({
          messageType: "error",
          message: errorMessage,
        });
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{modalType} User</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {(modalType === "Edit" || modalType === "Update") && modalData?.userId && (
          <TextField 
            label="User ID" 
            value={modalData.userId} 
            fullWidth 
            disabled 
          />
        )}

        <TextField
          label="Name"
          name="name"
          fullWidth
          required
          value={form.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          disabled={loading}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          required
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
        />

        {modalType === "Add" && (
          <TextField
            type="password"
            label="Password"
            name="password"
            fullWidth
            required
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
          />
        )}

        <TextField
          select
          label="Assign Role"
          name="role"
          fullWidth
          required
          value={form.role}
          onChange={handleChange}
          error={!!errors.role}
          helperText={errors.role}
          disabled={loading || allRoles.length === 0}
        >
          <MenuItem value="">
            {allRoles.length === 0 ? "Loading roles..." : "Select Role"}
          </MenuItem>
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
          required
          value={form.status}
          onChange={handleChange}
          disabled={loading}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="error" 
          variant="contained"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? "Saving..." : modalType === "Add" ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUser;