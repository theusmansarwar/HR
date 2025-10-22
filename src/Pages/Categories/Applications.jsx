// src/Pages/Applications.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddApplication from "../../Components/Models/AddApplications";

const Applications = () => {
  // Table columns/attributes
  const attributes = [
    { id: "applicationId", label: "Application ID" },
    { id: "jobId", label: "Job ID" },
    { id: "applicantName", label: "Applicant Name" },
    { id: "applicantEmail", label: "Applicant Email" },
    { id: "applicantPhone", label: "Applicant Phone" },
    { id: "resume", label: "Resume" },
    { id: "applicationDate", label: "Application Date" },
    { id: "applicationStatus", label: "Application Status" },
    { id: "interviewDate", label: "Interview Date" },
    { id: "remarks", label: "Remarks" },
  ];

  // Modal state
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [modalData, setModalData] = useState(null);

  // Save handler (called after add/update)
  const handleSave = (application) => {
    console.log("Saved application:", application);
    // Optional: refresh table data here
  };

  // Initialize table UI
  const { tableUI } = useTable({
    attributes,
    tableType: "Applications",
    onAdd: () => {
      setModalType("Add");
      setModalData(null);
      setOpen(true);
    },
    onEdit: (rowData) => {
      setModalType("Update");
      setModalData(rowData);
      setOpen(true);
    },
  });

  return (
    <>
      {tableUI}

      <AddApplication
        open={open}
        setOpen={setOpen}
        modalType={modalType}
        modalData={modalData}
        onSave={handleSave}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Applications;
