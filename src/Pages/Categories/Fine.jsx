import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddFine from "../../Components/Models/AddFine";

const Fines = () => {
  // Table columns
  const attributes = [
    { id: "fineId", label: "Fine ID" },
    { id: "employeeId.firstName", label: "Employee" },
    { id: "fineType", label: "Fine Type" },
    { id: "fineAmount", label: "Fine Amount" },
    { id: "fineDate", label: "Fine Date" },
    { id: "description", label: "Description" },
    { id: "status", label: "Status" },
  ];

  // Modal state
  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  // Handle save (after create/update)
  const handleSave = (fine) => {
    console.log("Saved fine:", fine);
  };

  // Table hook
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
          fetchData(); // Refresh table after Add/Update
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Fines;
