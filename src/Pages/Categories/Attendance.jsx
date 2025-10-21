import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddAttendance from "../../Components/Models/AddAttendance";

const Attendance = () => {
  const attributes = [
    { id: "_id", label: "Attendance ID" },
    { id: "_id", label: "Employee ID" },
    { id: "date", label: "Date" },
    { id: "status", label: "Status" },
    { id: "checkInTime", label: "Check In Time" },
    { id: "checkOutTime", label: "Check Out Time" },
    { id: "shiftName", label: "Shift Name" },
    { id: "overtimeHours", label: "Overtime Hours" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (attendance) => {
    console.log("Saved attendance:", attendance);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Attendance",
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

      <AddAttendance
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

export default Attendance;
