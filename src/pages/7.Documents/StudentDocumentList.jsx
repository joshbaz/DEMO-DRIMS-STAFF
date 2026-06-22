import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format, addDays, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import {
  useGetStudentDocuments,
  useDownloadStudentDocument
} from '../../store/tanstackStore/services/queries';
import { useSocket } from '../../hooks/useSocket';

const StudentDocumentList = ({ student, onDocumentSelect }) => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const { data: response, isLoading, error } = useGetStudentDocuments(student.id);

  // Extract documents array from the response
  const documents = response?.documents || [];

  // Socket event handlers for real-time updates
  const handleDocumentUpdate = useCallback((data) => {
    console.log('Document update received:', data);
    if (data.type === 'new_document_uploaded' && data.document?.studentId === student.id) {
      // Refresh the document list to show the new document
      window.location.reload();
    }
  }, [student.id]);

  // Initialize socket connection
  useSocket(handleDocumentUpdate, null, null);

  const downloadMutation = useDownloadStudentDocument();

  const handleDownload = (docItem) => {
    setDownloadingId(docItem.id);
    downloadMutation.mutate(docItem.id, {
      onSuccess: (response) => {
        console.log('Download response:', response);
        console.log('Document item:', docItem);

        // Get the blob data from the response
        const data = response.data;

        // Use the original filename from the document record
        const filename = docItem.fileName || docItem.title || 'document';

        console.log('Using filename:', filename);
        console.log('Data type:', typeof data);
        console.log('Data size:', data?.size || data?.length);

        // Create blob with the correct content type
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setDownloadingId(null);
        toast.success('Document downloaded successfully!');
      },
      onError: (error) => {
        console.error('Download error:', error);
        setDownloadingId(null);
        toast.error(error.message || 'Failed to download document');
      }
    });
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'PROPOSAL':
        return 'bg-blue-100 text-blue-800';
      case 'DISSERTATION':
        return 'bg-green-100 text-green-800';
      case 'CHAPTER':
        return 'bg-purple-100 text-purple-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      case 'REVIEWED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'PROPOSAL':
        return 'Proposal';
      case 'DISSERTATION':
        return 'Dissertation';
      case 'CHAPTER':
        return 'Chapter';
      case 'OTHER':
        return 'Other';
      case 'REVIEWED':
        return 'Reviewed';
      default:
        return type;
    }
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesFilter = filter === 'ALL' ||
      (filter === 'REVIEWED' ? doc.isReviewed : doc.type === filter);
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load documents</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Documents - {student.fullName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {student.registrationNumber}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="ALL">All Documents</option>
              <option value="PROPOSAL">Proposals</option>
              <option value="DISSERTATION">Dissertations</option>
              <option value="CHAPTER">Chapters</option>
              <option value="OTHER">Other</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredDocuments.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'This student has not uploaded any documents yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((document) => {
              const dueDate = addDays(new Date(document.uploadedAt), 14);
              const daysLeft = differenceInDays(dueDate, new Date());
              let dueTextClass = 'text-gray-500';
              let dueLabel = `Due in ${daysLeft} days`;
              
              let cardClass = 'border border-gray-200 hover:bg-gray-50';

              if (document.isReviewed) {
                cardClass = 'border-l-4 border-green-500 bg-green-50/50 hover:bg-green-50';
              } else if (daysLeft < 0) {
                dueTextClass = 'text-red-600 font-medium';
                dueLabel = `Overdue by ${Math.abs(daysLeft)} days`;
                cardClass = 'border-l-4 border-red-500 bg-red-50/50 hover:bg-red-50';
              } else if (daysLeft === 0) {
                dueTextClass = 'text-orange-500 font-medium';
                dueLabel = 'Due today';
                cardClass = 'border-l-4 border-orange-500 bg-orange-50/50 hover:bg-orange-50';
              } else if (daysLeft <= 3) {
                dueTextClass = 'text-orange-500 font-medium';
                cardClass = 'border-l-4 border-orange-500 bg-orange-50/50 hover:bg-orange-50';
              }

              return (
              <div
                key={document.id}
                className={`rounded-lg p-4 transition-colors cursor-pointer ${cardClass} shadow-sm`}
                onClick={() => onDocumentSelect(document, response?.documents)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.title}
                      </h3>
                      {!(document.type === 'REVIEWED' && document.isReviewed) && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.type)}`}>
                          {getDocumentTypeLabel(document.type)}
                        </span>
                      )}
                      {document.isReviewed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Reviewed
                        </span>
                      )}
                    </div>

                    {document.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {document.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Uploaded: {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
                      {document.uploadedBy && (
                        <span>By: {document.uploadedBy.name}</span>
                      )}
                      {document.fileSize && (
                        <span>{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                      {document.reviewedAt ? (
                        <span>Reviewed: {format(new Date(document.reviewedAt), 'MMM dd, yyyy')}</span>
                      ) : (
                        <span className={dueTextClass}>{dueLabel}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(document);
                      }}
                      disabled={downloadMutation.isPending && downloadingId === document.id}
                      className={`px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md transition-colors flex flex-row items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                        downloadingId === document.id 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Download document"
                    >
                      {downloadingId === document.id ? (
                        <>
                          <svg className="w-4 h-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                    {document.isReviewed || document.type === 'REVIEWED' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentSelect(document, response?.documents);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md transition-colors flex flex-row items-center gap-2 shadow-sm cursor-pointer"
                        title="Open review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Open Review
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentSelect(document, response?.documents);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors flex flex-row items-center gap-2 shadow-sm cursor-pointer"
                        title="Review document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDocumentList; 