import { invokeApi } from "../Utils/InvokeApi";


export const updateCategory = async (id,data) => {
 
  const reqObj = {
    path: ``,
    method: "PUT",
    headers: {      Authorization: `Bearer ${localStorage.getItem("Token")}`,},
    postData: data,
  };
  return invokeApi(reqObj);
};
