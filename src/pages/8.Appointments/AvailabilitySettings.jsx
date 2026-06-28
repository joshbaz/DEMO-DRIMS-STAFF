import React, { useState } from 'react';
import { useGetAvailabilities, useAddAvailability, useDeleteAvailability, useGetCampuses } from '../../store/tanstackStore/services/queries';
import { Calendar, Clock, Users, Trash2, Plus, MapPin, Video, FileText } from 'lucide-react';
import { format12HourTime } from '../../utils/formatTime';
import TimePicker from '../../components/TimePicker';

const AvailabilitySettings = () => {
  const { data: availabilities, isLoading } = useGetAvailabilities();
  const { data: campusesRes } = useGetCampuses();
  const campuses = campusesRes?.campuses || campusesRes || [];
  
  const addAvailability = useAddAvailability();
  const deleteAvailability = useDeleteAvailability();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxStudents, setMaxStudents] = useState(1);
  const [meetingType, setMeetingType] = useState('PHYSICAL');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(2);
  const [room, setRoom] = useState('');

  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [timeError, setTimeError] = useState('');

  const [activeTab, setActiveTab] = useState('ALL');

  const filteredAvailabilities = React.useMemo(() => {
    if (!availabilities) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return availabilities.filter(slot => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);

      if (activeTab === 'ALL') return true;
      if (activeTab === 'AVAILABLE') return slot.isActive && slotDate >= today;
      if (activeTab === 'PAST') return slot.isActive && slotDate < today;
      if (activeTab === 'CANCELLED') return !slot.isActive;
      return true;
    });
  }, [availabilities, activeTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeError('');
    if (!date || !startTime || !endTime || !maxStudents) return;

    if (startTime >= endTime) {
      setTimeError('Start time must be before end time.');
      return;
    }

    if (endTime > '20:00') {
      setTimeError('End time cannot go beyond 8:00 PM.');
      return;
    }

    addAvailability.mutate({
      date,
      startTime,
      endTime,
      maxStudents: parseInt(maxStudents),
      meetingType,
      location: meetingType === 'PHYSICAL' ? (room ? `${location} - ${room}` : location) : null,
      meetingLink: meetingType === 'VIRTUAL' ? meetingLink : null,
      purpose,
      recurringWeeks: isRecurring ? parseInt(recurringWeeks) : 1
    }, {
      onSuccess: () => {
        setDate('');
        setStartTime('');
        setEndTime('');
        setMaxStudents(1);
        setMeetingType('PHYSICAL');
        setLocation('');
        setMeetingLink('');
        setPurpose('');
        setIsRecurring(false);
        setRecurringWeeks(2);
        setRoom('');
      }
    });
  };

  const handleDelete = (slot) => {
    if (slot.currentBookings > 0) {
      setCancelModal(slot);
    } else {
      if (window.confirm('Are you sure you want to remove this availability slot?')) {
        deleteAvailability.mutate({ id: slot.id });
      }
    }
  };

  const submitCancel = (e) => {
    e.preventDefault();
    if (!cancelReason.trim() || !cancelModal) return;

    deleteAvailability.mutate({
      id: cancelModal.id,
      reason: `Cancellation Reason: ${cancelReason}`
    }, {
      onSuccess: () => {
        setCancelModal(null);
        setCancelReason('');
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Availability</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <TimePicker 
                value={startTime}
                onChange={setStartTime}
                required={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <TimePicker 
                value={endTime}
                onChange={setEndTime}
                required={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
            <input 
              type="number" 
              min="1"
              required
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="meetingType" 
                  value="PHYSICAL"
                  checked={meetingType === 'PHYSICAL'}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Physical</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="meetingType" 
                  value="VIRTUAL"
                  checked={meetingType === 'VIRTUAL'}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Virtual</span>
              </label>
            </div>
          </div>

          {meetingType === 'PHYSICAL' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Location</label>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a Branch</option>
                  {campuses.map(campus => (
                    <option key={campus.id} value={campus.name}>{campus.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room (Optional)</label>
                <input 
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 4B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <input 
                type="url" 
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                required
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Purpose</label>
            <textarea 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Chapter 1 review, general consultation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Repeat weekly</span>
            </label>
            
            {isRecurring && (
              <div className="pl-6 mt-3">
                <label className="block text-sm text-gray-600 mb-1">For how many weeks?</label>
                <input 
                  type="number" 
                  min="2"
                  max="12"
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(e.target.value)}
                  className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Creates {recurringWeeks} identical slots starting from the selected date.
                </p>
              </div>
            )}
          </div>

          {timeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{timeError}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={addAvailability.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addAvailability.isPending ? 'Adding...' : <><Plus size={18} /> Add Slot</>}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-medium text-gray-900">Your Available Slots</h2>
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg">
            {['ALL', 'AVAILABLE', 'PAST', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        
        {filteredAvailabilities && filteredAvailabilities.length > 0 ? (
          <div className="space-y-4">
            {filteredAvailabilities.map((slot) => (
              <div key={slot.id} className={`flex items-center justify-between p-4 rounded-lg border ${slot.isActive ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50 opacity-60'}`}>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-blue-500" />
                    <span>{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-blue-500" />
                    <span>{format12HourTime(slot.startTime)} - {format12HourTime(slot.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={18} className="text-blue-500" />
                    <span>{slot.currentBookings} / {slot.maxStudents} Booked</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 w-full sm:w-auto">
                    {slot.meetingType === 'PHYSICAL' ? (
                      <><MapPin size={18} className="text-blue-500" /> <span>{slot.location || 'Physical'}</span></>
                    ) : (
                      <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-medium transition-colors shadow-sm">
                        <Video size={14} /> 
                        Virtual Link
                      </a>
                    )}
                  </div>
                  {slot.purpose && (
                    <div className="flex items-center gap-2 text-gray-700 w-full">
                      <FileText size={18} className="text-gray-400" />
                      <span className="text-sm italic">{slot.purpose}</span>
                    </div>
                  )}
                </div>
                
                {slot.isActive && (
                  <button 
                    onClick={() => handleDelete(slot)}
                    disabled={deleteAvailability.isPending}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                    title="Remove slot"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                {!slot.isActive && (
                  <span className="text-xs font-medium text-red-600 px-2 py-1 bg-red-100 rounded-full">Cancelled</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p>No availability slots set.</p>
            <p className="text-sm">Add some slots to allow students to book appointments with you.</p>
          </div>
        )}
      </div>
      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              Remove Slot & Cancel Appointments
            </h3>
            <form onSubmit={submitCancel}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  This slot has <strong>{cancelModal.currentBookings} booked appointment(s)</strong>. They will be cancelled.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please provide a reason for cancelling the appointments (required)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
                  placeholder="I have an urgent meeting at this time..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModal(null);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason.trim() || deleteAvailability.isPending}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteAvailability.isPending ? 'Removing...' : 'Confirm Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySettings;
