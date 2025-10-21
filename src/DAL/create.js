// src/DAL/create.js
import { invokeApi } from "../Utils/InvokeApi";

export const createnewCategory = async (data) => {
  const reqObj = {
    path: "/category",
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createnewDepartment = async (data) => {
  const reqObj = {
    path: "/departments/createDepartment", 
    method: "POST",
    postData: data, 
  };
  return invokeApi(reqObj);
};

export const createDesignation = async (data) => {
  const reqObj = {
    path: "/designations/createDesignation",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createEmployee = async (data) => {
  const reqObj = {
    path: "/employees/createEmployee",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createAttendance = async (data) => {
  const reqObj = {
    path: "/attendance/createAttendance",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createLeaves = async (data) => {
  const reqObj = {
    path: "/leaves/createLeave",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createJobs = async (data) => {
  const reqObj = {
    path: "/jobs/createJob",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createApplications = async (data) => {
  const reqObj = {
    path: "/applications/createApplication",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createPerformance = async (data) => {
  const reqObj = {
    path: "/performance/createPerformance",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createTraining = async (data) => {
  const reqObj = {
    path: "/training/createTraining",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createFines = async (data) => {
  const reqObj = {
    path: "/fines/createFine",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};

export const createPayroll = async (data) => {
  const reqObj = {
    path: "/payroll/createPayroll",
    method: "POST",
    postData: data,
  };
  return invokeApi(reqObj);
};




