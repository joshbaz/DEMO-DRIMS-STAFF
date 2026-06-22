import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUploadReviewedDocument, useDownloadStudentDocument } from '../../store/tanstackStore/services/queries';

const DocumentReviewModal = ({ isOpen, onClose, document, allDocuments, student }) => {
  const [reviewComments, setReviewComments] = useState('');
  const [reviewedFile, setReviewedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingAnotherReview, setIsAddingAnotherReview] = useState(false);

  const uploadReviewedMutation = useUploadReviewedDocument();
  const downloadMutation = useDownloadStudentDocument();

  const handleDownload = (docId, filename) => {
    setIsDownloading(true);
    const downloadDocId = typeof docId === 'string' ? docId : document.id;
    const downloadFilename = typeof filename === 'string' ? filename : (document.fileName || document.title || 'document');
    
    downloadMutation.mutate(downloadDocId, {
      onSuccess: (response) => {
        const data = response.data;
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = downloadFilename;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        setIsDownloading(false);
        toast.success('Document downloaded successfully!');
      },
      onError: (error) => {
        setIsDownloading(false);
        toast.error(error.message || 'Failed to download document');
      }
    });
  };

  const relatedReviews = allDocuments?.filter(d => 
    d.type === 'REVIEWED' && d.title === `Reviewed: ${document?.title}`
  ) || [];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid file type (PDF, DOC, or DOCX)');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setReviewedFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewedFile) {
      toast.error('Please upload a reviewed document');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', reviewedFile);
      formData.append('reviewComments', reviewComments);

      await uploadReviewedMutation.mutateAsync({
        documentId: document.id,
        formData
      });

      toast.success('Reviewed document uploaded successfully!');
      setIsAddingAnotherReview(false);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload reviewed document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReviewComments('');
    setReviewedFile(null);
    setIsAddingAnotherReview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Review Document</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Document Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Document Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Title:</span> {document.title}
              </div>
              <div>
                <span className="font-medium">Type:</span> {document.type}
              </div>
              <div>
                <span className="font-medium">Student:</span> {student.fullName}
              </div>
              <div>
                <span className="font-medium">Uploaded:</span> {new Date(document.uploadedAt).toLocaleDateString()}
              </div>
              {document.description && (
                <div>
                  <span className="font-medium">Description:</span> {document.description}
                </div>
              )}
            </div>
          </div>

          {(document.isReviewed || document.type === 'REVIEWED') && !isAddingAnotherReview ? (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-medium text-green-900">Review Status</h3>
                </div>
                <p className="text-sm text-green-800 mb-2">
                  This document was reviewed on {new Date(document.reviewedAt || document.uploadedAt).toLocaleDateString()}
                </p>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    {document.type === 'REVIEWED' ? 'Reviewed File:' : 'Original Submitted File:'}
                  </h4>
                  <div className="flex flex-col gap-3 bg-white p-3 rounded border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={document.fileName || document.title}>
                            {document.fileName || document.title}
                          </p>
                          {document.fileSize && (
                            <p className="text-xs text-gray-500">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    </div>
                    {document.description && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="font-medium text-gray-700 block mb-1">
                          {document.type === 'REVIEWED' ? "Supervisor's Feedback:" : "Student's Comment:"}
                        </span>
                        <div className="whitespace-pre-wrap">{document.description}</div>
                      </div>
                    )}
                  </div>
                </div>

                {relatedReviews.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="text-sm font-medium text-green-900 mb-3">Reviewed Files from Supervisor:</h4>
                    <div className="space-y-3">
                      {relatedReviews.map((reviewDoc) => (
                        <div key={reviewDoc.id} className="flex flex-col gap-3 bg-white p-3 rounded border border-green-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={reviewDoc.fileName || reviewDoc.title}>
                                  {reviewDoc.fileName || reviewDoc.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                  {reviewDoc.fileSize && (
                                    <span>{(reviewDoc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                  )}
                                  <span>&bull;</span>
                                  <span>Uploaded: {new Date(reviewDoc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleDownload(reviewDoc.id, reviewDoc.fileName || reviewDoc.title)}
                              disabled={isDownloading}
                              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>
                          </div>
                          
                          {(reviewDoc.reviewComments || reviewDoc.description) && (
                            <div className="text-sm text-gray-600 bg-green-50/50 p-3 rounded border border-green-50">
                              <span className="font-medium text-green-800 block mb-1">Supervisor's Feedback:</span>
                              <div className="whitespace-pre-wrap">{reviewDoc.reviewComments || reviewDoc.description}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              <div className="flex justify-end pt-4 space-x-3">
                {document.type !== 'REVIEWED' && (
                  <button
                    type="button"
                    onClick={() => setIsAddingAnotherReview(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    Add Another Review
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Review Comments */}
            <div>
              <label htmlFor="reviewComments" className="block text-sm font-medium text-gray-700 mb-1">
                Review Comments
              </label>
              <textarea
                id="reviewComments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide feedback and comments on the document..."
              />
            </div>

            {/* Upload Reviewed Document */}
            <div>
              <label htmlFor="reviewedFile" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Reviewed Document *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-14 w-14 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="reviewedFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="reviewedFile"
                        name="reviewedFile"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
              {reviewedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {reviewedFile.name} ({(reviewedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (document.isReviewed) {
                    setIsAddingAnotherReview(false);
                  } else {
                    handleClose();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reviewedFile}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Review'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewModal; 