import { invokeApi } from "../Utils/InvokeApi";

export const fetchcategorylist = async () => {
  const reqObj = {
    path: "/category/live",
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },

    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchDashboard = async () => {
  const reqObj = {
    path: "",
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },

    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchDashboardChart = async () => {
  const reqObj = {
    path: "/views/get/count",
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },

    postData: {},
  };
  return invokeApi(reqObj);
};
export const fetchallcategorylist = async (page, rowsPerPages) => {
  const reqObj = {
    path: `/category/view?limit=${rowsPerPages}&page=${page}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },

    body: {},
  };
  
  return invokeApi(reqObj);
};

export const fetchDepartments = async () => {
  const reqObj = {
    path: "/departments/getDepartments",
    method: "GET",
     headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  };
  return invokeApi(reqObj);
};

export const fetchDesignations = async () => {
  const reqObj = {
    path: "/designations/getDesignations",
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const fetchEmployees = async () => {
  const reqObj = {
    path: "/employees/getEmployees",
    method: "GET",
  };
  return invokeApi(reqObj);
}
export const fetchAttendance = async () => {
  const reqObj = {
    path: "/attendance/getAttendances",
    method: "GET",
  };
  return invokeApi(reqObj);
};

// export const fetchLeaves = async () => {
//   const reqObj = {
//     path: "/leaves/getLeaves",
//     method: "GET",
//   };
//   return invokeApi(reqObj);
// };
export const fetchLeaves = async () => {
  const reqObj = {
    path: "/leaves/getLeaves",
    method: "GET",
    headers: {
      "Cache-Control": "no-cache",
    },
  };
  return invokeApi(reqObj);
};

export const fetchJobs = async () => {
  const reqObj = {
    path: "/jobs/getJobs",
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const fetchApplications = async () => {
  const reqObj = {
    path: "/applications/getApplications",
    method: "GET",
  };
  return invokeApi(reqObj);
  };

export const fetchPerformance = async () => {
  const reqObj = {
    path: "/performance/getPerformance",
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const fetchTrainings = async () => {
  const reqObj = {
    path: "/training/getTrainings",
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const fetchFines = async () => {
  const reqObj = {  
    path: "/fines/getFines",
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const fetchPayrolls = async () => {
  const reqObj = {
    path: "/payroll/getPayrolls",
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const fetchRoleByName = async (roleName) => {
  const reqObj = {
    path: `/roles/getRoleByName/${roleName}`,
    method: "GET",
  };
  return invokeApi(reqObj);
};

export const getRoles = async () => {
  const token = localStorage.getItem("token"); 
  const reqObj = {
    path: "/roles/getRole",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return invokeApi(reqObj);
};

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  return invokeApi({
    path: "/users/getUsers",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
