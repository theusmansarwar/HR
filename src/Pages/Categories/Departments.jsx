import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddDepartment from "../../Components/Models/addDepartments";

const Departments = () => {
  const attributes = [
    { id: "departmentId", label: "Department ID" },
    { id: "departmentName", label: "Department Name" },
    { id: "headOfDepartment", label: "Head of Department" },
    { id: "createdDate", label: "Created Date" },
    { id: "updatedDate", label: "Updated Date" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (department) => {
    console.log("Saved department:", department);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Departments",
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

      <AddDepartment
  open={open}
  setOpen={setOpen}
  Modeltype={modelType}
  Modeldata={modelData}
  onResponse={(res) => {
    console.log(res.message);
    if (res.messageType === "success") {
      fetchData(); // Refresh table after add/update success
    }
  }}
/>

    </>
  );
};

export default Departments;
