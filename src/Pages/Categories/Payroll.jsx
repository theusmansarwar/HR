import React, { useState } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddPayroll from "../../Components/Models/AddPayroll";

const Payroll = () => {
  const attributes = [
    { id: "_id", label: "Payroll ID" },
    { id: "employeeId.firstName", label: "Employee Name" },
    { id: "month", label: "Month" },
    { id: "basicSalary", label: "Basic Salary" },
    { id: "deductions", label: "Deductions" },
    { id: "overtime", label: "Overtime" },
    { id: "netSalary", label: "Net Salary" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  // Simple save handler — connect this later to DAL (createPayroll / updatePayroll)
  const handleSave = (payroll) => {
    console.log("Saved payroll:", payroll);
  };

  const { tableUI, fetchData } = useTable({
    attributes,
    tableType: "Payroll",
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

      <AddPayroll
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

export default Payroll;
