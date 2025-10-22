// src/Components/Models/AddEmployee.jsx
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
import { useState } from "react";
import { createEmployee } from "../../DAL/create";
import { updateEmployee } from "../../DAL/edit";
import { fetchDepartments, fetchDesignations } from "../../DAL/fetch";

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

const statusOptions = ["Active", "Inactive"];
const genderOptions = ["Male", "Female", "Other"];
const employmentTypes = [
  "Full-Time",
  "Part-Time",
  "Internship",
  "Contract",
  "Remote",
];

export default function AddEmployee({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
  onSave,
}) {
  const [form, setForm] = React.useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    cnic: "",
    departmentId: "",
    designationId: "",
    dateOfJoining: "",
    employeementType: "",
    status: "Active",
    salary: "",
    bankAccountNo: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNo: "",
  });

  const [id, setId] = React.useState("");
  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [file, setFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [resume, setResume] = useState(null); 
  const handleFileChange = (e) => {
  setResume(e.target.files[0]);  
}
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const depRes = await fetchDepartments();
        console.log("Departments API Response:", depRes?.data);
        const desRes = await fetchDesignations();
        if (depRes?.data) setDepartments(depRes.data);
        if (desRes?.data) setDesignations(desRes.data);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };
    fetchData();
  }, []);

React.useEffect(() => {
  if (Modeldata) {
    setForm({
      employeeId: Modeldata?.employeeId || "",
      firstName: Modeldata?.firstName || "",
      lastName: Modeldata?.lastName || "",
      email: Modeldata?.email || "",
      phoneNumber: Modeldata?.phoneNumber || "",
      // :white_check_mark: Format the date properly
      dateOfBirth: Modeldata?.dateOfBirth
        ? Modeldata.dateOfBirth.split("T")[0]
        : "",
      gender: Modeldata?.gender || "",
      cnic: Modeldata?.cnic || "",
      departmentId:
        Modeldata?.departmentId?._id || Modeldata?.departmentId || "",
      designationId:
        Modeldata?.designationId?._id || Modeldata?.designationId || "",
      dateOfJoining: Modeldata?.dateOfJoining
        ? Modeldata.dateOfJoining.split("T")[0]
        : "",
      employeementType: Modeldata?.employeementType || "",
      status: Modeldata?.status || "Active",
      salary: Modeldata?.salary || "",
      bankAccountNo: Modeldata?.bankAccountNo || "",
      address: Modeldata?.address || "",
      emergencyContactName: Modeldata?.emergencyContactName || "",
      emergencyContactNo: Modeldata?.emergencyContactNo || "",
    });
    setId(Modeldata?._id || "");
    if (Modeldata?.profileImage) {
      setImagePreview(Modeldata.profileImage);
    }
  }
}, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
    if (file) {
      formData.append("profileImage", file);
    }

    let response;
    if (Modeltype === "Add") {
      response = await createEmployee(formData, true);
    } else {
      response = await updateEmployee(id, formData, true);
    }

    if (response?.status === 201 || response?.status === 200) {
      onResponse({
        messageType: "success",
        message: response.message,
      });

      onSave(response.data);
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
        <Typography variant="h6" mb={2}>
          {Modeltype} Employee
        </Typography>

        <Box sx={{ maxHeight: "65vh", overflowY: "auto", pr: 1 }}>
          <Grid container spacing={2}>
            {/* Employee ID */}
            <Grid item xs={6}>
              <TextField
                label="Employee ID"
                name="employeeId"
                fullWidth
                value={form.employeeId}
                onChange={handleChange}
              />
            </Grid>

            {/* First Name */}
            <Grid item xs={6}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={form.firstName}
                onChange={handleChange}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={form.lastName}
                onChange={handleChange}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={6}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                fullWidth
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </Grid>

            {/* DOB */}
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Date of Birth"
                name="dateOfBirth"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={6}>
              <TextField
                select
                label="Gender"
                name="gender"
                fullWidth
                value={form.gender}
                onChange={handleChange}
              >
                {genderOptions.map((g, index) => (
                  <MenuItem key={index} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* CNIC */}
            <Grid item xs={6}>
              <TextField
                label="CNIC"
                name="cnic"
                fullWidth
                value={form.cnic}
                onChange={handleChange}
              />
            </Grid>

            {/* Department */}
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

            {/* Designation */}
            <Grid item xs={6}>
              <TextField
                select
                label="Designation"
                name="designationId"
                fullWidth
                value={form.designationId}
                onChange={handleChange}
              >
                {designations.map((des) => (
                  <MenuItem key={des._id} value={des._id}>
                    {des.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Joining Date */}
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Joining Date"
                name="dateOfJoining"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.dateOfJoining}
                onChange={handleChange}
              />
            </Grid>

            {/* Employment Type */}
            <Grid item xs={6}>
              <TextField
                select
                label="Employment Type"
                name="employeementType"
                fullWidth
                value={form.employeementType}
                onChange={handleChange}
              >
                {employmentTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Status */}
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

            {/* Salary */}
            <Grid item xs={6}>
              <TextField
                label="Salary"
                name="salary"
                type="number"
                fullWidth
                value={form.salary}
                onChange={handleChange}
              />
            </Grid>

            {/* Bank Account No */}
            <Grid item xs={6}>
              <TextField
                label="Bank Account No"
                name="bankAccountNo"
                fullWidth
                value={form.bankAccountNo}
                onChange={handleChange}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                fullWidth
                multiline
                rows={2}
                value={form.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Emergency Contact Name"
                name="emergencyContactName"
                fullWidth
                value={form.emergencyContactName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Emergency Contact No"
                name="emergencyContactNo"
                fullWidth
                value={form.emergencyContactNo}
                onChange={handleChange}
              />
            </Grid>

<Grid item xs={6}>
  <TextField
    select
    label="Archive"
    name="isArchived"
    fullWidth
    value={form.isArchived ? "true" : "false"}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        isArchived: e.target.value === "true",
      }))
    }
  >
    <MenuItem value="false">False</MenuItem>
    <MenuItem value="true">True</MenuItem>
  </TextField>
</Grid>

    <Grid item xs={12}>
              <Button variant="contained" component="label">
                Upload Profile Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    setFile(selectedFile);
                    setImagePreview(URL.createObjectURL(selectedFile));
                  }}
                />
              </Button>
              {imagePreview && (
                <Box mt={2}>
                  <Typography
                    variant="body2"
                    sx={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                    }}
                    onClick={() => window.open(imagePreview, "_blank")}
                  >
                    Preview
                  </Typography>
                </Box>
              )}
            </Grid>
           <Grid item xs={6}>
                       <Button variant="contained" component="label" fullWidth>
                         Upload Resume
                         <input type="file" hidden name="resume" onChange={handleChange} />
                       </Button>
                       {form.resume && (
                         <Button
                           variant="text"
                           size="small"
                           sx={{ mt: 1 }}
                           onClick={() =>
                             window.open(
                               typeof form.resume === "string"
                                 ? `/uploads/${form.resume}`
                                 : URL.createObjectURL(form.resume),
                               "_blank"
                             )
                           }
                         >
                           View Resume
                         </Button>
                       )}
                     </Grid>
          </Grid>
        </Box>

        {/* Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
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
