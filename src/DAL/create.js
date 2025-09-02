import { invokeApi } from "../Utils/InvokeApi";

export const createnewCategory = async (data) => {

  const reqObj = {
    path: "/",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};
