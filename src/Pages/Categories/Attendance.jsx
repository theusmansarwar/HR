import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddAttendance from "../../Components/Models/AddAttendance";

const Attendance = () => {
  // Table column definitions
  const attributes = [
    { id: "attendanceId", label: "Attendance ID" },
    { id: "employeeId.employeeId", label: "Employee ID" },
    { id: "employeeId.firstName", label: "First Name" },
    { id: "employeeId.lastName", label: "Last Name" },
    { id: "date", label: "Date" },
    { id: "status", label: "Status" },
    { id: "checkInTime", label: "Check In Time" },
    { id: "checkOutTime", label: "Check Out Time" },
    { id: "shiftName", label: "Shift Name" },
    { id: "overtimeHours", label: "Overtime Hours" },
  ];

  // State for modal and current row
  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  // Called when a row is added/updated
  const handleSave = (attendance) => {
    console.log("Saved attendance:", attendance);
  };

  // Use the reusable table hook
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
          fetchData(); // Refresh table after add/update
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Attendance;
