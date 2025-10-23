// src/Pages/Employees.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddEmployee from "../../Components/Models/addEmployee";

const Employees = () => {
  const attributes = [
    { id: "employeeId", label: "Employee ID" },
    { id: "firstName", label: "First Name" },
    { id: "lastName", label: "Last Name" },
    { id: "email", label: "Email" },
    { id: "phoneNumber", label: "Phone Number" },
    { id: "dateOfBirth", label: "Date of Birth" },
    { id: "gender", label: "Gender" },
    { id: "cnic", label: "CNIC" },
    { id: "departmentId.departmentName", label: "Department" },
    { id: "designationId.designationName", label: "Designation" },
    { id: "createdAt", label: "Joining Date" },
    { id: "status", label: "Status" },
    { id: "salary", label: "Salary" },
    { id: "bankAccountNo", label: "Bank Account No" },
    { id: "address", label: "Address" },
    { id: "emergencyContactName", label: "Emergency Contact Name" },
    { id: "emergencyContactNo", label: "Emergency Contact No" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (employee) => {
    console.log("Saved employee:", employee);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Employees",
    onAdd: () => {
      setModelType("Add");
      setModelData(null);
      setOpen(true);
    },
    onEdit: (rowData) => {
      setModelType("Update");
      setModelData(rowData);
      setOpen(true);
    },
  });

  return (
    <>
      {tableUI}

      <AddEmployee
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={(data) => {
          handleSave(data);
          fetchData(); // refresh table
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Employees;
