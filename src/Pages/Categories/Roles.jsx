import React, { useState, useEffect } from "react";
import axios from "axios";

const allModules = [
  "Dashboard","Users","Roles", "Departments","Designations","Employees",
  "Attendance","Leaves","Performance","Training",
  "Payroll","Fines","Jobs","Applications","Reports"
];

function Roles({ currentUser }) {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get("/api/roles");
    setRoles(res.data);
  };

  const handleCheckbox = (module) => {
    if (selectedModules.includes(module)) {
      setSelectedModules(selectedModules.filter(m => m !== module));
    } else {
      setSelectedModules([...selectedModules, module]);
    }
  };

  const createRole = async () => {
    await axios.post("/api/roles", { name: roleName, modules: selectedModules });
    setRoleName("");
    setSelectedModules([]);
    fetchRoles();
  };

  if (currentUser.role !== "Admin") return <p>Access Denied</p>;

  return (
    <div>
      <h2>Roles</h2>

      <div>
        <input 
          type="text" 
          placeholder="Role Name" 
          value={roleName} 
          onChange={(e) => setRoleName(e.target.value)} 
        />
        <div>
          {allModules.map((mod) => (
            <label key={mod}>
              <input 
                type="checkbox" 
                checked={selectedModules.includes(mod)}
                onChange={() => handleCheckbox(mod)}
              />
              {mod}
            </label>
          ))}
        </div>
        <button onClick={createRole}>Add Role</button>
      </div>

      <ul>
        {roles.map(role => (
          <li key={role._id}>
            {role.name} - Modules: {role.modules.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Roles;
