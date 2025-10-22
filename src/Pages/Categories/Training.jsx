// src/Pages/Training.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddTraining from "../../Components/Models/AddTraining";

const Training = () => {
  const attributes = [
    { id: "trainingId", label: "Training ID" },
    { id: "employeeId.firstName", label: "Employee" },
    { id: "trainingName", label: "Training Name" },
    { id: "startDate", label: "Start Date" },
    { id: "endDate", label: "End Date" },
    // { id: "certificate", label: "Certificate" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (training) => {
    console.log("Saved training:", training);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Training",
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

      <AddTraining
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={(data) => {
        handleSave(data);
        fetchData(); 
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Training;
