// src/Pages/Performance.jsx
import React, { useState, useEffect } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddPerformance from "../../Components/Models/AddPerformance";

import { fetchPerformance } from "../../DAL/fetch";
import { deletePerformance } from "../../DAL/delete";

const Performance = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  const attributes = [
    { id: "_id", label: "Performance ID" },
    { id: "_id", label: "Employee ID" },
    { id: "KPIs", label: "KPIs" },
    { id: "appraisalDate", label: "Appraisal Date" },
    { id: "score", label: "Score" },
    { id: "remarks", label: "Remarks" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  // Fetch all performance records
  const loadPerformance = async () => {
    try {
      setLoading(true);
      const res = await fetchPerformance();
      if (res?.data) {
        setPerformances(res.data);
      }
    } catch (err) {
      console.error("Error fetching performance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  // Handle add/update performance
  const handleSave = (performance) => {
    if (modelType === "Add") {
      setPerformances((prev) => [...prev, performance]);
    } else {
      setPerformances((prev) =>
        prev.map((p) => (p._id === performance._id ? performance : p))
      );
    }
  };

  // Handle delete performance
  const handleDelete = async (id) => {
    try {
      const res = await deletePerformance(id);
      if (res?.success || res?.status === 200) {
        setPerformances((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Error deleting performance record:", err);
    }
  };

  const { tableUI } = useTable({
    attributes,
    tableType: "Performance",
    pageData: performances,
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
    onDelete: handleDelete,
  });

  return (
    <>
      {loading ? <p>Loading performance records...</p> : tableUI}

      <AddPerformance
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

export default Performance;
