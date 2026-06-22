import React, { useState } from 'react';
import { useGetAssignedStudents } from '../../store/tanstackStore/services/queries';
import StudentDocumentList from './StudentDocumentList';
import DocumentReviewModal from './DocumentReviewModal';

const Documents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [studentDocuments, setStudentDocuments] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: studentsData, isLoading: isLoadingStudents } = useGetAssignedStudents();
  const students = studentsData?.students || [];

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedDocument(null);
  };

  const handleDocumentSelect = (document, allDocs = []) => {
    setSelectedDocument(document);
    setStudentDocuments(allDocs);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedDocument(null);
  };

  if (isLoadingStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student Documents</h1>
        <p className="text-gray-600 mt-1">Review and provide feedback on student documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Students</h2>
              <p className="text-sm text-gray-500 mt-1">Select a student to view their documents</p>
            </div>
            <div className="p-4">
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-14 w-14 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any students assigned to you yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`w-full text-left p-3 rounded-md transition-colors cursor-pointer ${selectedStudent?.id === student.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {student.registrationNumber}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-3">
          {selectedStudent ? (
            <StudentDocumentList
              student={selectedStudent}
              onDocumentSelect={handleDocumentSelect}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <svg
                  className="mx-auto h-14 w-14 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a student</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a student from the list to view their documents.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Review Modal */}
      {selectedDocument && (
        <DocumentReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          document={selectedDocument}
          allDocuments={studentDocuments}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default Documents; 