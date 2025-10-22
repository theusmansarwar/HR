import { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddLeaves from "../../Components/Models/AddLeaves";

const Leaves = () => {
  const attributes = [
    { id: "leaveId", label: "Leave ID" },
    { id: "employeeId.firstName", label: "Employee" },
    { id: "leaveType", label: "Leave Type" },
    { id: "startDate", label: "Start Date" },
    { id: "endDate", label: "End Date" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const handleSave = (leave) => console.log("Saved leave:", leave);

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Leaves",
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
      <AddLeaves
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

export default Leaves;
