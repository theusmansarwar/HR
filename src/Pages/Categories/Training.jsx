// src/Pages/Training.jsx
import { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddTraining from "../../Components/Models/AddTraining";

const Training = () => {
  const attributes = [
    { id: "_id", label: "Training ID" },
    { id: "_id", label: "Employee" },
    { id: "trainingName", label: "Training Name" },
    { id: "startDate", label: "Start Date" },
    { id: "endDate", label: "End Date" },
    { id: "certificate", label: "Certificate" },
    { id: "status", label: "Status" },
    // { id: "archive", label: "Archive" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (training) => {
    console.log("Saved training:", training);
  };

  // useTable hook handles fetching, pagination, search, etc.
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
          fetchData(); // Refresh after add/update
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Training;
