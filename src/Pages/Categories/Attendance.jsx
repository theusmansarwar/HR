import { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddAttendance from "../../Components/Models/AddAttendance";

const Attendance = () => {
  const attributes = [
    { id: "attendanceId", label: "Attendance ID" },
    { id: "employeeId.firstName", label: "First Name" },
    { id: "employeeId.lastName", label: "Last Name" },
    { id: "createdAt", label: "Date" },
    { id: "status", label: "Status" },
    { id: "checkInTime", label: "Check In Time" },
    { id: "checkOutTime", label: "Check Out Time" },
    { id: "shiftName", label: "Shift Name" },
    { id: "overtimeHours", label: "Overtime Hours" },
  ];

  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [modalData, setModalData] = useState(null);

  const handleSave = (attendance) => {
    console.log("Saved attendance:", attendance);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Attendance",
    transformRow: (row) => ({
      ...row,
      employeeIdValue: row.employeeId?.employeeId || "N/A",
      firstName: row.employeeId?.firstName || "N/A",
      lastName: row.employeeId?.lastName || "N/A",
    }),
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
      <AddAttendance
        open={open}
        setOpen={setOpen}
        Modeltype={modalType}
        Modeldata={modalData}
        onSave={(data) => {
          handleSave(data);
          fetchData(); // refresh table
        }}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Attendance;
