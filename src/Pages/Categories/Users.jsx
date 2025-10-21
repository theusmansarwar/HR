import React, { useState, useEffect } from "react";
import axios from "axios";

function Users({ currentUser }) {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roles: [],
    status: "active"
  });

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get("/api/roles");
    setRoles(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("/api/users");
    setUsers(res.data);
  };

  const handleRoleCheckbox = (roleId) => {
    const newRoles = formData.roles.includes(roleId)
      ? formData.roles.filter(r => r !== roleId)
      : [...formData.roles, roleId];

    setFormData({ ...formData, roles: newRoles });
  };

  const createUser = async () => {
    await axios.post("/api/users", formData);
    setFormData({ name: "", email: "", password: "", roles: [], status: "active" });
    fetchUsers();
  };

  if (currentUser.role !== "Admin") return <p>Access Denied</p>;

  return (
    <div>
      <h2>Users</h2>

      <div>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <h4>Assign Roles</h4>
        {roles.map(role => (
          <label key={role._id}>
            <input 
              type="checkbox" 
              checked={formData.roles.includes(role._id)}
              onChange={() => handleRoleCheckbox(role._id)}
            />
            {role.name}
          </label>
        ))}

        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button onClick={createUser}>Create User</button>
      </div>

      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email} - {user.status} - Roles: {user.roles.map(r => r.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
