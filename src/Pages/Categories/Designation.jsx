// src/Pages/Designations.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddDesignation from "../../Components/Models/AddDesignations";
import { fetchDesignations } from "../../DAL/fetch";
import { createDesignation } from "../../DAL/create";
import { updateDesignation } from "../../DAL/edit";

const Designations = () => {
  const attributes = [
    { id: "designationId", label: "Designation ID" },
    { id: "designationName", label: "Designation Name" },
    { id: "departmentId", label: "Department ID" },
    { id: "createdDate", label: "Created Date" },
    { id: "updatedDate", label: "Updated Date" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  // Handle Save or Update Designation
  const handleSave = async (designation) => {
    try {
      if (modelType === "Add") {
        const res = await createDesignation(designation);
        if (res?.data) {
          console.log("Designation created:", res.data);
        }
      } else {
        const res = await updateDesignation(designation._id, designation);
        if (res?.data) {
          console.log("Designation updated:", res.data);
        }
      }
    } catch (err) {
      console.error("Error saving designation:", err);
    }
  };

  // useTable Hook for displaying table + handling modal
  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Designations",
    fetchFunction: fetchDesignations,
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

      <AddDesignation
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={async (data) => {
          await handleSave(data);
          fetchData(); // refresh table after save or update
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Designations;
