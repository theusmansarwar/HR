import { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddRole from "../../Components/Models/AddRole";

const allModules = [
  "Dashboard","Users","Roles", "Departments","Designations","Employees",
  "Attendance","Leaves","Performance","Training",
  "Payroll","Fines","Jobs","Applications","Reports"
];

const Roles = ({ currentUser }) => {
  const user = currentUser || JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [modalData, setModalData] = useState(null);

  const attributes = [
    { id: "name", label: "Role Name" },
    { id: "description", label: "Description" },
    { id: "status", label: "Status" },
  ];

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Roles",
    onAdd: () => { setModalType("Add"); setModalData(null); setOpen(true); },
    onEdit: row => { setModalType("Update"); setModalData(row); setOpen(true); }
  });

  const handleSave = () => fetchData();

  if (user?.role !== "HR") return <p>Access Denied</p>;

  return (
    <>
      {tableUI}
      <AddRole open={open} setOpen={setOpen} modalType={modalType} modalData={modalData} allModules={allModules} onSave={handleSave} />
    </>
  );
};

export default Roles;
