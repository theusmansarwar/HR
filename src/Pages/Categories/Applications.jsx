 // src/Pages/Applications.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddApplication from "../../Components/Models/AddApplications";

const Applications = () => {
  const attributes = [
    { id: "_id", label: "Application ID" },
    { id: "_id", label: "Job ID" },
    { id: "applicantName", label: "Applicant Name" },
    { id: "applicantEmail", label: "Applicant Email" },
    { id: "applicantPhone", label: "Applicant Phone" },
    { id: "resume", label: "Resume" },
    { id: "applicationDate", label: "Application Date" },
    { id: "applicationStatus", label: "Application Status" },
    { id: "interviewDate", label: "Interview Date" },
    { id: "remarks", label: "Remarks" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (application) => {
    console.log("Saved attendance:", application);
  };

  const { tableUI } = useTable({
    attributes,
    tableType: "Applications",
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

      <AddApplication
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={handleSave}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Applications;
