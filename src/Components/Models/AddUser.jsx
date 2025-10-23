import { useState, useEffect } from "react";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [status, setStatus] = useState("active");
  const [allRoles, setAllRoles] = useState([]);

  // // Fetch all roles for dropdown
  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     const res = await getRoles();
  //     setAllRoles(res || []);
  //   };
  //   fetchRoles();
  // }, []);

  useEffect(() => {
  const fetchRoles = async () => {
    const res = await getRoles();
    setAllRoles(res?.data || []); // ✅ always safe, even if backend sends 304
  };
  fetchRoles();
}, []);

  // Populate modal on edit
  useEffect(() => {
    if (modalData) {
      setName(modalData.name || "");
      setEmail(modalData.email || "");
      setPassword(""); // never prefill password
      setRole(modalData.role || "");
      setStatus(modalData.status || "active");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setStatus("active");
    }
  }, [modalData]);

  const handleSubmit = async () => {
    if (!name || !email || (modalType === "Add" && !password) || !role) {
      if (onResponse)
        onResponse({ message: "Please fill all required fields", messageType: "error" });
      return;
    }

    const payload = { name, email, password, role, status };

    try {
      let response;
      if (modalType === "Add") response = await createUser(payload);
      else response = await updateUser(modalData._id, payload);

      if (response?.message?.toLowerCase().includes("success")) {
        if (onSave) onSave(response);
        if (onResponse)
          onResponse({
            message: `${modalType} User Successfully!`,
            messageType: "success",
          });
        setOpen(false);
      } else {
        if (onResponse)
          onResponse({ message: response?.message || "Failed", messageType: "error" });
      }
    } catch (err) {
      console.error(err);
      if (onResponse)
        onResponse({ message: "Error saving user", messageType: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{modalType} User</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        {modalType === "Add" && (
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
        )}
        {/* Role dropdown */}
        <TextField
          select
          label="Assign Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
        >
          {allRoles.map((r) => (
            <MenuItem key={r._id} value={r.name}>
              {r.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Status dropdown */}
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUser;
