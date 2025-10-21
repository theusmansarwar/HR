// src/Pages/Fines.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddFine from "../../Components/Models/AddFine";

const Fines = () => {
  const attributes = [
    { id: "fineId", label: "Fine ID" },
    { id: "_id", label: "Employee ID" },
    { id: "fineType", label: "Fine Type" },
    { id: "fineAmount", label: "Fine Amount" },
    { id: "fineDate", label: "Fine Date" },
    { id: "description", label: "Description" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (fine) => {
    console.log("Saved fine:", fine);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Fines",
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

      <AddFine
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={(data) => {
          handleSave(data);
          fetchData(); // Refresh table after add/update
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Fines;
