import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";

const ActivityLogs = () => {
  // Table columns (attributes)
  const attributes = [
    { id: "user.userName", label: "User" },
    { id: "action", label: "Action" },
    { id: "module", label: "Module" },
    { id: "description", label: "Description" },
    { id: "createdAt", label: "Date & Time" },
  ];

  // Modal state (not needed here, just for structure consistency)
  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("View");
  const [modelData, setModelData] = useState(null);

  // Handle actions (if needed later)
  const handleSave = (activity) => {
    console.log("Saved/Updated activity:", activity);
  };

  // useTable hook
  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Activity", // 👈 This will call your `/api/activities` backend route
    onAdd: null, // No add modal needed for logs
    onEdit: (rowData) => {
      setModelType("View");
      setModelData(rowData);
      setOpen(true);
    },
  });

  return (
    <>
      {tableUI}
      {/* You can later add a modal if you want to view details */}
    </>
  );
};

export default ActivityLogs;
