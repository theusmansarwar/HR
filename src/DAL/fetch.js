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

export const fetchDesignations = async (page = 1, rowsPerPage = 10, searchQuery = "") => {
  const reqObj = {
    path: `/designations/getDesignations?page=${page}&limit=${rowsPerPage}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};


 export const fetchEmployees = async (page = 1, rowsPerPage = 10, searchQuery = "") => {
  const reqObj = {
    path: `/employees/getEmployees?page=${page}&limit=${rowsPerPage}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};
export const fetchAttendance = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/attendance/getAttendances?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};


 
 export const fetchLeaves = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/leaves/getLeaves?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
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

 export const fetchApplications = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/applications/getApplications?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchPerformance = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/performance/getPerformance?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};


export const fetchTrainings = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/training/getTrainings?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};


export const fetchFines = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/fines/getFines?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
  };
  return invokeApi(reqObj);
};


export const fetchPayrolls = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/payroll/getPayrolls?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Token")}`,
    },
    postData: {},
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

 
// export const getRoles = async (page = 1, limit = 10, searchQuery = "") => {
//   const token = localStorage.getItem("token");
//   if (!token) throw new Error("No token found, please login");
  
//   const reqObj = {
//     path: `/roles/getRole?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     postData: {},
//   };
//   return invokeApi(reqObj);
// };

export const getRoles = async (page = 1, limit = 10, searchQuery = "") => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found, please login");

  const reqObj = {
    path: `/roles/getRole?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache", // ✅ prevents 304 caching issue
    },
    postData: {},
  };

  try {
    const res = await invokeApi(reqObj);

    // ✅ Ensure response format is always predictable
    if (res?.data && Array.isArray(res.data)) {
      return res; // normal response with roles list
    } else if (res?.data?.data && Array.isArray(res.data.data)) {
      // in case invokeApi wraps response in another `data`
      return res.data;
    } else {
      console.warn("Unexpected roles response:", res);
      return { data: [] }; // fallback empty list
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { data: [] }; // avoid crash even if fetch fails
  }
};




export const getUsers = async (page = 1, limit = 10, searchQuery = "") => {
  const reqObj = {
    path: `/users/getUsers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    postData: {},
  };
  return invokeApi(reqObj);
};

export const fetchReports = async () => {
  const reqObj = {
    path: "/reports/getReports",   
    method: "GET",
  };
  return invokeApi(reqObj);
};
export const fetchReportById = async (id) => {
  const reqObj = {
    path: `/reports/getReportById/${id}`,
    method: "GET",
  };
  return invokeApi(reqObj);
};
