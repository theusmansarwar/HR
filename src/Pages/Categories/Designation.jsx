import React, { useState, useEffect } from "react";
import { useTable } from "../../Components/Models/useTable";
import AddDesignation from "../../Components/Models/AddDesignations";

import { fetchDesignations } from "../../DAL/fetch";
import { createDesignation } from "../../DAL/create";
import { updateDesignation } from "../../DAL/edit";

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  const attributes = [
    { id: "designationId", label: "Designation ID" },
    { id: "designationName", label: "Designation Name" },
    { id: "departmentId", label: "Department ID" },
    { id: "createdDate", label: "Created Date" },
    { id: "updatedDate", label: "Updated Date" },
    { id: "status", label: "Status" },
  ];

  const [open, setOpen] = useState(false);
  const [modelType, setModelType] = useState("Add");
  const [modelData, setModelData] = useState(null);

  const loadDesignations = async () => {
    try {
      setLoading(true);
      const res = await fetchDesignations();
      if (res?.data) {
        setDesignations(res.data);
      }
    } catch (err) {
      console.error("Error fetching designations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const handleSave = async (designation) => {
    try {
      let res;
      if (modelType === "Add") {
        res = await createDesignation(designation);
        if (res?.data) {
          setDesignations((prev) => [...prev, res.data]);
        }
      } else {
        res = await updateDesignation(designation.id, designation);
        if (res?.data) {
          setDesignations((prev) =>
            prev.map((d) => (d.id === designation.id ? res.data : d))
          );
        }
      }
    } catch (err) {
      console.error("Error saving designation:", err);
    }
  };

  const { tableUI } = useTable({
    attributes,
    tableType: "Designations",
    pageData: designations,
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
      {loading ? <p>Loading designations...</p> : tableUI}

      <AddDesignation
        open={open}
        setOpen={setOpen}
        Modeltype={modelType}
        Modeldata={modelData}
        onSave={handleSave}
        onResponse={(res) => console.log(res.message)}
      />
    </>
  );
};

export default Designations;
