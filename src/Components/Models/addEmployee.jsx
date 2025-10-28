import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Grid,
  MenuItem,
  Divider,
  Avatar,
} from "@mui/material";
import { createEmployee } from "../../DAL/create";
import { updateEmployee } from "../../DAL/edit";
import { fetchDepartments, fetchDesignations } from "../../DAL/fetch";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: "950px",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const statusOptions = ["Active", "Inactive", "On Leave", "Terminated", "Resigned"];
const genderOptions = ["Male", "Female", "Other"];
const employmentTypes = ["Full-Time", "Part-Time", "Internship", "Contract", "Remote"];

export default function AddEmployee({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onSave,
  onResponse,
}) {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    cnic: "",
    departmentId: "",
    designationId: "",
    employeementType: "",
    status: "Active",
    salary: "",
    bankAccountNo: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNo: "",
    isArchived: false,
  });

  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [id, setId] = React.useState("");
  const [profileImage, setProfileImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  // ✅ Fetch dropdowns and prefill form if editing
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const depRes = await fetchDepartments();
        const desRes = await fetchDesignations();
        setDepartments(depRes?.data || []);
        setDesignations(desRes?.data || []);

        if (Modeldata) {
          setForm({
            firstName: Modeldata?.firstName || "",
            lastName: Modeldata?.lastName || "",
            email: Modeldata?.email || "",
            phoneNumber: Modeldata?.phoneNumber || "",
            dateOfBirth: Modeldata?.dateOfBirth
              ? Modeldata.dateOfBirth.split("T")[0]
              : "",
            gender: Modeldata?.gender || "",
            cnic: Modeldata?.cnic || "",
            departmentId:
              Modeldata?.departmentId?._id || Modeldata?.departmentId || "",
            designationId:
              Modeldata?.designationId?._id || Modeldata?.designationId || "",
            employeementType: Modeldata?.employeementType || "",
            status: Modeldata?.status || "Active",
            salary: Modeldata?.salary || "",
            bankAccountNo: Modeldata?.bankAccountNo || "",
            address: Modeldata?.address || "",
            emergencyContactName: Modeldata?.emergencyContactName || "",
            emergencyContactNo: Modeldata?.emergencyContactNo || "",
            isArchived: Modeldata?.isArchived || false,
          });
          setId(Modeldata?._id || "");
          if (Modeldata?.profileImage) setImagePreview(Modeldata.profileImage);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    loadData();
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear field error on change
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle backend-driven validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (profileImage) formData.append("profileImage", profileImage);

      let response;
      if (Modeltype === "Add") {
        response = await createEmployee(formData, true);
      } else {
        response = await updateEmployee(id, formData, true);
      }

      const missingFields =
        response?.data?.missingFields || response?.missingFields;
      if (missingFields && missingFields.length > 0) {
        const backendErrors = {};
        missingFields.forEach((f) => {
          backendErrors[f.name] = f.message;
        });
        setErrors(backendErrors);
        return;
      }

      if (response?.status === 201 || response?.status === 200) {
        onSave(response.data);
        onResponse({
          messageType: "success",
          message: response.message || "Employee saved successfully",
        });
        setOpen(false);
      } else {
        onResponse({
          messageType: "error",
          message: response.message || "Something went wrong",
        });
      }
    } catch (err) {
      const missingFields = err.response?.data?.missingFields;
      if (missingFields && missingFields.length > 0) {
        const backendErrors = {};
        missingFields.forEach((f) => {
          backendErrors[f.name] = f.message;
        });
        setErrors(backendErrors);
        return;
      }

      console.error("Error saving employee:", err);
      onResponse({
        messageType: "error",
        message: "Error saving employee",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {/* HEADER */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #ddd",
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 10,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {Modeltype} Employee
          </Typography>
        </Box>

        {/* CONTENT */}
        <Box
          sx={{
            flex: 1,
            overflowY: "scroll",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            p: 3,
          }}
        >
          <Grid container spacing={2}>
            {/* Profile Image */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={imagePreview || ""}
                  alt="Profile"
                  sx={{ width: 70, height: 70 }}
                />
                <Button variant="outlined" component="label">
                  Upload Profile Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </Button>
              </Box>
            </Grid>

            {/* BASIC INFO */}
            <Grid item xs={6}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                value={form.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={form.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                fullWidth
                value={form.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                label="Date of Birth"
                name="dateOfBirth"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Gender"
                name="gender"
                fullWidth
                value={form.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
              >
                {genderOptions.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CNIC"
                name="cnic"
                fullWidth
                value={form.cnic}
                onChange={handleChange}
                error={!!errors.cnic}
                helperText={errors.cnic}
              />
            </Grid>

            {/* JOB INFO */}
            <Grid item xs={6}>
              <TextField
                select
                label="Department"
                name="departmentId"
                fullWidth
                value={form.departmentId}
                onChange={handleChange}
                error={!!errors.departmentId}
                helperText={errors.departmentId}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departments.map((dep) => (
                  <MenuItem key={dep._id} value={dep._id}>
                    {dep.departmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Designation"
                name="designationId"
                fullWidth
                value={form.designationId}
                onChange={handleChange}
                error={!!errors.designationId}
                helperText={errors.designationId}
              >
                <MenuItem value="">Select Designation</MenuItem>
                {designations.map((des) => (
                  <MenuItem key={des._id} value={des._id}>
                    {des.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label="Employment Type"
                name="employeementType"
                fullWidth
                value={form.employeementType}
                onChange={handleChange}
                error={!!errors.employeementType}
                helperText={errors.employeementType}
              >
                {employmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
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
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Salary"
                name="salary"
                type="number"
                fullWidth
                value={form.salary}
                onChange={handleChange}
                error={!!errors.salary}
                helperText={errors.salary}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Bank Account No"
                name="bankAccountNo"
                fullWidth
                value={form.bankAccountNo}
                onChange={handleChange}
                error={!!errors.bankAccountNo}
                helperText={errors.bankAccountNo}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                fullWidth
                multiline
                rows={2}
                value={form.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
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
          </Grid>
        </Box>

        {/* FOOTER BUTTONS */}
        <Divider />
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            bgcolor: "background.paper",
          }}
        >
          <Button onClick={handleClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: "darkBlue" }}
          >
            {Modeltype === "Add" ? "Submit" : "Update"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
