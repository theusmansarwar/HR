import { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddUser from "../../Components/Models/AddUser";

const Users = ({ currentUser }) => {
  const user = currentUser || JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [modalData, setModalData] = useState(null);
  const [response, setResponse] = useState(null);

  const attributes = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { 
      id: "role", 
      label: "Role",
      render: (row) => row.role || "N/A"
    },
    { 
      id: "status", 
      label: "Status",
      render: (row) => row.status || "N/A"
    },
  ];

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

  const handleSave = async (userData) => {
    console.log("User saved, refreshing table...", userData);
    setOpen(false);
    await fetchData();
  };

  const handleResponse = (responseData) => {
    setResponse(responseData);
    console.log("Response:", responseData);
  };

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
        onResponse={handleResponse}
      />
    </>
  );
};

export default Users;