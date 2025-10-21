import { invokeApi } from "../Utils/InvokeApi";

// Login API Call
export const login = async (formData) => {
  const reqObj = {
    path: "/users/login", // Changed to match the login endpoint you described
    method: "POST",
    headers: {},
    postData: formData,
  };
  return invokeApi(reqObj);
};

// Logout API Call
export const logout = async () => {
  const reqObj = {
    path: "/api/admin/logout", // Ensure your backend listens on this endpoint
    method: "POST", // Typically POST or DELETE for logout
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Use the correct token key
    },
  };
  return invokeApi(reqObj);
};
