import { invokeApi } from "../Utils/InvokeApi";


export const deleteAllCategories = async (data) => {
  const reqObj = {
    path: ``,
    method: "DELETE", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  
  return invokeApi(reqObj);
};

export const deleteDepartment = async (id) => {
  const reqObj = {
    path: `/departments/deleteDepartment/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteDesignation = async (id) => {
  const reqObj = {
    path: `/designations/deleteDesignation/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteEmployee = async (id) => {
  const reqObj = {
    path: `/employees/deleteEmployee/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteAttendance = async (id) => {
  const reqObj = {
    path: `/attendance/deleteAttendance/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteLeaves = async (id) => {
  const reqObj = {
    path: `/leaves/deleteLeave/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteJobs = async (id) => {
  const reqObj = {
    path: `/jobs/deleteJob/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteApplications = async (id) => {
  const reqObj = {
    path: `/applications/deleteApplication/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
  };

  export const deletePerformance = async (id) => {  
  const reqObj = {
    path: `/performance/deletePerformance/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteTraining = async (id) => {
  const reqObj = {
    path: `/training/deleteTraining/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deleteFines = async (id) => {
  const reqObj = {
    path: `/fines/deleteFine/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};

export const deletePayroll = async (id) => {
  const reqObj = {
    path: `/payroll/deletePayroll/${id}`,
    method: "DELETE",
  };
  return invokeApi(reqObj);
};
