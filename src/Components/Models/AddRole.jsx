import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { createRole } from "../../DAL/create";
import { updateRole } from "../../DAL/edit";

const AddRole = ({
  open,
  setOpen,
  modalType,
  modalData,
  allModules,
  onSave,
  onResponse,
}) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (modalData) {
      setRoleName(modalData.name || "");
      setDescription(modalData.description || "");
      setModules(modalData.modules || []);
      setStatus(modalData.status || "Active");
    } else {
      setRoleName("");
      setDescription("");
      setModules([]);
      setStatus("Active");
    }
    setErrors({});
  }, [modalData]);

  const handleCheckbox = (mod) => {
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = async () => {
    setErrors({});

    const rolePayload = {
      name: roleName,
      description,
      modules,
      status,
    };

    try {
      let response;
      if (modalType === "Add") {
        response = await createRole(rolePayload);
      } else {
        response = await updateRole(modalData._id, rolePayload);
      }

      console.log("Backend Response:", response); 
      if (response?.status === 400 && response.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);

        if (onResponse)
          onResponse({
            message: response.message || "Validation failed",
            messageType: "error",
          });
        return;
      }

      if (
        response?.status === 200 ||
        response?.status === 201 ||
        response?.message?.toLowerCase().includes("success")
      ) {
        if (onSave) onSave(response.role || rolePayload);
        if (onResponse)
          onResponse({
            message: `${modalType} Role Successfully!`,
            messageType: "success",
          });
        setOpen(false);
      } else {
        if (onResponse)
          onResponse({
            message: response?.message || "Something went wrong",
            messageType: "error",
          });
      }
    } catch (error) {
      console.error("Error while saving role:", error);
      if (onResponse)
        onResponse({
          message: "Internal Server Error",
          messageType: "error",
        });
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{modalType} Role</DialogTitle>
      <DialogContent>
        <TextField
          label="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          fullWidth
          margin="dense"
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="dense"
          error={!!errors.description}
          helperText={errors.description}
        />

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          margin="dense"
          error={!!errors.status}
          helperText={errors.status}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>

        <FormGroup
          row
          sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: 2 }}
        >
          {allModules.map((mod) => (
            <FormControlLabel
              key={mod}
              control={
                <Checkbox
                  checked={modules.includes(mod)}
                  onChange={() => handleCheckbox(mod)}
                  sx={{
                    color: "var(--primary-color)",
                    "&.Mui-checked": { color: "var(--accent-color)" },
                  }}
                />
              }
              label={mod}
              sx={{ width: "180px", marginRight: 0 }}
            />
          ))}
        </FormGroup>
        {errors.modules && (
          <FormHelperText error>{errors.modules}</FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRole;
