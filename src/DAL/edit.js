


// export const updateCategory = async (id,data) => {
 
//   const reqObj = {
//     path: ``,
//     method: "PUT",
//     headers: {      Authorization: `Bearer ${localStorage.getItem("Token")}`,},
//     postData: data,
//   };
//   return invokeApi(reqObj);
// };

// For now, just log the data instead of calling API

// src/DAL/edit.js
import { invokeApi } from "../Utils/InvokeApi";

export const updateCategory = async (id, data) => {
  const reqObj = {
    path: `/category/${id}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateDepartment = async (id, data) => {
  const reqObj = {
    path: `/departments/updateDepartment/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateDesignation = async (id, data) => {
  const reqObj = {
    path: `/designations/updateDesignation/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateEmployee = async (id, data) => {
  const reqObj = {
    path: `/employees/updateEmployee/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateAttendance = async (id, data) => {
  const reqObj = {
    path: `/attendance/updateAttendance/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateLeave = async (id, data) => {
  const reqObj = {
    path: `/leaves/updateLeave/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateJob = async (id, data) => {
  const reqObj = {
    path: `/jobs/updateJob/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateApplications = async (id, data) => {
  const reqObj = {
    path: `/applications/updateApplication/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updatePerformance = async (id, data) => {
  const reqObj = {
    path: `/performance/updatePerformance/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateTraining = async (id, data) => {
  const reqObj = {
    path: `/training/updateTraining/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updateFines = async (id, data) => {
  const reqObj = {
    path: `/fines/updateFine/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const updatePayroll = async (id, data) => {
  const reqObj = {
    path: `/payroll/updatePayroll/${id}`,
    method: "PUT",
    postData: data,
  };
  return invokeApi(reqObj);
};