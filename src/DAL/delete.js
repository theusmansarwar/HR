import { invokeApi } from "../Utils/InvokeApi";


export const deleteAllCategories = async (data) => {
  const reqObj = {
    path: ``,
    method: "DELETE", // Ensure correct capitalization
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  
  return invokeApi(reqObj);
};