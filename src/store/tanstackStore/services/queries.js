import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  loginSupervisor, 
  getSupervisorProfile, 
  updateSupervisorProfile,
  changePassword,
  logoutSupervisor,
  getAssignedStudents,
  getStudentDetails,
  updateStudentProgress,
  getStudentProposals,
  reviewProposal,
  getDashboardStats,
  getNotifications,
  getStudentStatuses,
  getStudentBooksService,
  getSchoolProposals,
  getAllBooksService,
  getUnreadMessageCount,
  getRecentMessages,
  getStatusStatistics,
  getStudentDocumentsService,
  downloadStudentDocumentService,
  uploadReviewedDocumentService
} from "./api";

/* ********** AUTH QUERIES ********** */

export const useLoginSupervisor = () => {
  return useMutation({
    mutationFn: loginSupervisor,
  });
};

export const useGetSupervisorProfile = () => {
  return useQuery({
    queryKey: ['supervisorProfile'],
    queryFn: getSupervisorProfile,
    enabled: !!localStorage.getItem('umi_auth_token'),
  });
};

export const useUpdateSupervisorProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupervisorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['supervisorProfile']);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

export const useLogoutSupervisor = () => {
  return useMutation({
    mutationFn: logoutSupervisor,
  });
};

/* ********** STUDENT QUERIES ********** */

export const useGetAssignedStudents = () => {
  return useQuery({
    queryKey: ['assignedStudents'],
    queryFn: getAssignedStudents,
  });
};

export const useGetStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: () => getStudentDetails(studentId),
    enabled: !!studentId,
  });
};

export const useUpdateStudentProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }) => updateStudentProgress(studentId, data),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries(['studentDetails', studentId]);
      queryClient.invalidateQueries(['assignedStudents']);
    },
  });
};

/********* STUDENT STATUS QUERIES ******* */

export function useGetStudentStatuses(studentId) {
  return useQuery({
    queryKey: ['studentStatuses', studentId],
    queryFn: () => getStudentStatuses(studentId),
    enabled: !!studentId,
   
  });
}

/* ********** PROPOSAL QUERIES ********** */

export const useGetStudentProposals = (studentId) => {
  return useQuery({
    queryKey: ['studentProposals', studentId],
    queryFn: () => getStudentProposals(studentId),
    enabled: !!studentId,
  });
};

export const useReviewProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, data }) => reviewProposal(proposalId, data),
    onSuccess: (_, { proposalId }) => {
      queryClient.invalidateQueries(['studentProposals']);
      queryClient.invalidateQueries(['dashboardStats']);
    },
  });
};


export function useGetSchoolProposals() {
  return useQuery({
    queryKey: ['schoolProposals'],
    queryFn: getSchoolProposals,
    
  });
}

/** Dissertation management */
export function useGetStudentBooks(studentId) {
  return useQuery({
    queryKey: ['studentBooks', studentId],
    queryFn: () => getStudentBooksService(studentId),
    enabled: !!studentId,
  });
}

export function useGetAllBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: getAllBooksService,
    
  });
}



/* ********** DASHBOARD QUERIES ********** */

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });
};

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
};

export const useGetRecentMessages = () => {
  return useQuery({
    queryKey: ['recentMessages'],
    queryFn: getRecentMessages,
  });
};

export const useGetStatusStatistics = (category = 'main') => {
  return useQuery({
    queryKey: ['statusStatistics', category],
    queryFn: () => getStatusStatistics(category),
  });
};

/* ********** MESSAGES QUERIES ********** */

export const useGetUnreadMessageCount = () => {
  return useQuery({
    queryKey: ['unreadMessageCount'],
    queryFn: getUnreadMessageCount,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}; 

/* ********** DOCUMENT MANAGEMENT QUERIES ********** */

export const useGetStudentDocuments = (studentId) => {
  return useQuery({
    queryKey: ['studentDocuments', studentId],
    queryFn: () => getStudentDocumentsService(studentId),
    enabled: !!studentId,
  });
};

export const useDownloadStudentDocument = () => {
  return useMutation({
    mutationFn: downloadStudentDocumentService,
  });
};

export const useUploadReviewedDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, formData }) => uploadReviewedDocumentService(documentId, formData),
    onSuccess: (_, { documentId }) => {
      // Invalidate student documents to refresh the list
      queryClient.invalidateQueries(['studentDocuments']);
    },
  });
}; 