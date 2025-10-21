// src/Pages/Jobs.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddJob from "../../Components/Models/AddJobs";

const Jobs = () => {

  const attributes = [
    { id: "_id", label: "Job ID" },
    { id: "jobTitle", label: "Job Title" },
    { id: "jobDescription", label: "Description" },
  { id: "departmentId.departmentName", label: "Department" },
{ id: "designationId.designationName", label: "Designation" },
    { id: "status", label: "Status" },
    { id: "postingDate", label: "Posting Date" },
    { id: "expiryDate", label: "Expiry Date" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (job) => {
    console.log("Saved job:", job);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Jobs",
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

      <AddJob
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

export default Jobs;
