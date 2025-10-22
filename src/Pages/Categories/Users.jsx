import { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddUser from "../../Components/Models/AddUser";

const Users = ({ currentUser }) => {
  const user = currentUser || JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [modalData, setModalData] = useState(null);

  // Attributes for table columns
  const attributes = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { 
      id: "role", 
      label: "Role",
      render: (row) => row.role || "N/A" // show role string from backend
    },
    { 
      id: "status", 
      label: "Status",
      render: (row) => row.status || "N/A"
    },
  ];

  // Initialize useTable
  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Users",
    onAdd: () => {
      setModalType("Add");
      setModalData(null);
      setOpen(true);
    },
    onEdit: (row) => {
      setModalType("Update");
      setModalData(row);
      setOpen(true);
    },
  });

  // Refresh table after save
  const handleSave = () => fetchData();

  // Role-based access
  if (!["HR"].includes(user?.role)) return <p>Access Denied</p>;

  return (
    <>
      {tableUI}
      <AddUser
        open={open}
        setOpen={setOpen}
        modalType={modalType}
        modalData={modalData}
        onSave={handleSave}
      />
    </>
  );
};

export default Users;
