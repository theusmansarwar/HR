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
  MenuItem
} from "@mui/material";
import { createRole } from "../../DAL/create";
import { updateRole } from "../../DAL/edit";

const AddRole = ({ open, setOpen, modalType, modalData, allModules, onSave, onResponse }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (modalData) {
      setRoleName(modalData.name || "");
      setDescription(modalData.description || "");
      setModules(modalData.modules || []);
      setStatus(modalData.status || "active");
    } else {
      setRoleName("");
      setDescription("");
      setModules([]);
      setStatus("active");
    }
  }, [modalData]);

  const handleCheckbox = (mod) => {
    setModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

//   const handleSubmit = async () => {
//     const rolePayload = { _id: modalData?._id, name: roleName, description, modules, status };
//     try {
//       let response;
//       if (modalType === "Add") {
//         response = await createRole(rolePayload);
//       } else {
//         response = await updateRole(modalData._id, rolePayload);
//       }

//       if (response?.message?.toLowerCase().includes("success")) {
//         if (onSave) onSave(response); // refresh table
//         if (onResponse) onResponse({ message: `${modalType} Role Successfully!`, messageType: "success" });
//         setOpen(false);
//       } else {
//         if (onResponse) onResponse({ message: response?.message || "Failed to save role", messageType: "error" });
//       }
//     } catch (error) {
//       console.error("Error while saving role:", error);
//       if (onResponse) onResponse({ message: "Error while saving role", messageType: "error" });
//     }
//   };
const handleSubmit = async () => {
  const rolePayload = {
    _id: modalData?._id,
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

    // ✅ Check if backend returned success message
    if (response?.message?.toLowerCase().includes("success")) {
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
          message: response?.message || "Failed to save role",
          messageType: "error",
        });
    }
  } catch (error) {
    console.error("Error while saving role:", error);
    if (onResponse)
      onResponse({ message: "Error while saving role", messageType: "error" });
  }
};


  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{modalType} Role</DialogTitle>
      <DialogContent>
        <TextField label="Role Name" value={roleName} onChange={e => setRoleName(e.target.value)} fullWidth margin="dense" />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth margin="dense" />
        <TextField select label="Status" value={status} onChange={e => setStatus(e.target.value)} fullWidth margin="dense">
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>

        <FormGroup row sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: 2 }}>
          {allModules.map(mod => (
            <FormControlLabel
              key={mod}
              control={<Checkbox checked={modules.includes(mod)} onChange={() => handleCheckbox(mod)} sx={{ color: "var(--primary-color)", '&.Mui-checked': { color: "var(--accent-color)" } }} />}
              label={mod}
              sx={{ width: "180px", marginRight: 0 }}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRole;
