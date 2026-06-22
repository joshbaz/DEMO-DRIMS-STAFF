import React, { useState } from 'react';
import { useGetAppointments, useUpdateAppointment } from '../../store/tanstackStore/services/queries';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const UpcomingAppointments = () => {
  const { data: appointments, isLoading } = useGetAppointments();
  const updateAppointment = useUpdateAppointment();

  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleStatusChange = (id, newStatus) => {
    updateAppointment.mutate({ id, status: newStatus });
  };

  const submitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || !feedbackModal) return;

    updateAppointment.mutate({
      id: feedbackModal,
      feedback: feedbackText,
      status: 'COMPLETED'
    }, {
      onSuccess: () => {
        setFeedbackModal(null);
        setFeedbackText('');
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  }

  // Filter out cancelled ones or sort them
  const activeAppointments = appointments?.filter(a => a.status !== 'CANCELLED') || [];

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-6">Upcoming Appointments</h2>

      {activeAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAppointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    {apt.student?.fullName}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{apt.student?.registrationNumber}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    apt.status === 'NO_SHOW' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                  }`}>
                  {apt.status}
                </span>
              </div>

              <div className="p-4 flex-grow flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-blue-500" />
                  {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-blue-500" />
                  {apt.startTime} - {apt.endTime}
                </div>

                {apt.notes && (
                  <div className="mt-2 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                    <span className="font-medium text-gray-700 block mb-1">Student Note:</span>
                    <p className="text-gray-600 italic">{apt.notes}</p>
                  </div>
                )}

                {apt.feedback && (
                  <div className="mt-2 text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
                    <span className="font-medium text-blue-800 block mb-1">Your Feedback:</span>
                    <p className="text-blue-700">{apt.feedback}</p>
                  </div>
                )}
              </div>

              {apt.status === 'CONFIRMED' && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => setFeedbackModal(apt.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={16} /> Complete
                  </button>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'NO_SHOW')}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                  >
                    <XCircle size={16} /> No Show
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
          <p className="text-gray-500">Students haven't booked any appointments yet.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" />
              Complete Appointment
            </h3>
            <form onSubmit={submitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add feedback or notes from this meeting (optional but recommended)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Discussed chapter 2..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateAppointment.isPending}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-sm transition-colors"
                >
                  {updateAppointment.isPending ? 'Saving...' : 'Mark Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;
