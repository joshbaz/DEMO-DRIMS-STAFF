import apiRequest from "../../../utils/apiRequestUrl"

/* ********** ERROR HANDLING ********** */

const errorHandling = (error) => {
    if (error?.response) {
        throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
    } else if (error.request) {
        throw {message: "No response from server. Please check your network connection."}
    } else {
        throw {message: `Request failed: ${error.message}`}
    }
}

/* ********** AUTH ********** */

export const loginSupervisor = async (user) => {
    try {
        const response = await apiRequest.post("/supervisor/login", user);
        const { token, role } = response.data
        localStorage.setItem('role', role);
        localStorage.setItem('umi_auth_token', token);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getSupervisorProfile = async () => {
    try {
        const response = await apiRequest.get("/supervisor/profile");
        return {
            ...response.data,
            loginTime: new Date().toISOString()
        };
    } catch (error) {
        errorHandling(error);
    }
};

export const updateSupervisorProfile = async (data) => {
    try {
        const response = await apiRequest.put("/supervisor/profile", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const changePassword = async (data) => {
    try {
        const response = await apiRequest.put("/supervisor/password", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const logoutSupervisor = async () => {
    try {
        const response = await apiRequest.post("/supervisor/logout")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** STUDENT MANAGEMENT ********** */

export const getAssignedStudents = async () => {
    try {
        const response = await apiRequest.get("/supervisor/students");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getStudentDetails = async (studentId) => {
    try {
        const response = await apiRequest.get(`/supervisor/students/${studentId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateStudentProgress = async (studentId, data) => {
    try {
        const response = await apiRequest.put(`/supervisor/students/${studentId}/progress`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

/*** STUDENT STATUS MANAGEMENT */

export const getStudentStatuses = async (studentId) => {
    try {
        const response = await apiRequest.get(`/supervisor/students/${studentId}/statuses`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/** Dissertation management */
export const getStudentBooksService = async (studentId) => {
    try {
      const response = await apiRequest.get(`/supervisor/student-books/${studentId}`);
      return response.data;
    } catch (error) {
      errorHandling(error);
    }
  }

  export const getAllBooksService = async () => {
    try {
      const response = await apiRequest.get('/supervisor/books');
      return response.data;
    } catch (error) {
      errorHandling(error);
    }
  }

/* ********** PROPOSAL MANAGEMENT ********** */

export const getStudentProposals = async (studentId) => {
    try {
        const response = await apiRequest.get(`/supervisor/students/${studentId}/proposals`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const reviewProposal = async (proposalId, data) => {
    try {
        const response = await apiRequest.put(`/supervisor/proposals/${proposalId}/review`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getSchoolProposals = async () => {
    try {
        const response = await apiRequest.get("/supervisor/proposals")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** DASHBOARD ********** */

export const getDashboardStats = async () => {
    try {
        const response = await apiRequest.get("/supervisor/dashboard/stats");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getNotifications = async () => {
    try {
        const response = await apiRequest.get("/supervisor/notifications");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getRecentMessages = async () => {
    try {
        const response = await apiRequest.get("/messages/conversations");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getStatusStatistics = async (category = 'main') => {
    try {
        const response = await apiRequest.get(`/supervisor/dashboard/status-statistics?category=${category}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

/* ********** MESSAGES ********** */

export const getUnreadMessageCount = async () => {
    try {
        const response = await apiRequest.get("/messages/unread-count");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}; 

/* ********** DOCUMENT MANAGEMENT ********** */

export const getStudentDocumentsService = async (studentId) => {
    try {
        const response = await apiRequest.get(`/supervisor/students/${studentId}/documents`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const downloadStudentDocumentService = async (documentId) => {
    try {
        const response = await apiRequest.get(`/supervisor/documents/${documentId}/download`, {
            responseType: 'blob'
        });
        
        // Return the response directly for blob data
        return response;
    } catch (error) {
        errorHandling(error);
    }
};

export const uploadReviewedDocumentService = async (documentId, formData) => {
    try {
        const response = await apiRequest.post(`/supervisor/documents/${documentId}/review`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}; 

/* ********** APPOINTMENTS ********** */

export const getAvailabilitiesService = async () => {
    try {
        const response = await apiRequest.get("/supervisor/appointments/availability");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const addAvailabilityService = async (data) => {
    try {
        const response = await apiRequest.post("/supervisor/appointments/availability", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteAvailabilityService = async (id) => {
    try {
        const response = await apiRequest.delete(`/supervisor/appointments/availability/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAppointmentsService = async () => {
    try {
        const response = await apiRequest.get("/supervisor/appointments");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateAppointmentService = async ({ id, ...data }) => {
    try {
        const response = await apiRequest.put(`/supervisor/appointments/${id}/status`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};