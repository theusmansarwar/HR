// src/Pages/Performance.jsx
import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddPerformance from "../../Components/Models/AddPerformance";

const Performance = () => {
  const attributes = [
    { id: "performanceId", label: "Performance ID" },
    { id: "employeeId.firstName", label: "Employee First Name" },
    { id: "employeeId.lastName", label: "Employee Last Name" },
    { id: "KPIs", label: "KPIs" },
    { id: "appraisalDate", label: "Appraisal Date" },
    { id: "score", label: "Score" },
    { id: "remarks", label: "Remarks" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Performance",
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
    onDelete: async (id) => {
      // use deletePerformance from DAL inside useTable
      const { deletePerformance } = await import("../../DAL/delete");
      try {
        const res = await deletePerformance(id);
        if (res?.status === 200 || res?.success) {
          fetchData(); // refresh table after delete
        }
      } catch (err) {
        console.error("Error deleting performance record:", err);
      }
    },
  });

  return (
    <>
      {tableUI}

      <AddPerformance
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={() => fetchData()} // refresh table after add/update
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Performance;
