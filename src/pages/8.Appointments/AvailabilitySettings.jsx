import React, { useState } from 'react';
import { useGetAvailabilities, useAddAvailability, useDeleteAvailability } from '../../store/tanstackStore/services/queries';
import { Calendar, Clock, Users, Trash2, Plus } from 'lucide-react';

const AvailabilitySettings = () => {
  const { data: availabilities, isLoading } = useGetAvailabilities();
  const addAvailability = useAddAvailability();
  const deleteAvailability = useDeleteAvailability();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxStudents, setMaxStudents] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !maxStudents) return;

    addAvailability.mutate({
      date,
      startTime,
      endTime,
      maxStudents: parseInt(maxStudents)
    }, {
      onSuccess: () => {
        setDate('');
        setStartTime('');
        setEndTime('');
        setMaxStudents(1);
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this availability slot? Any booked appointments will be cancelled.')) {
      deleteAvailability.mutate(id);
    }
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
              <input 
                type="time" 
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Available Slots</h2>
        
        {availabilities && availabilities.length > 0 ? (
          <div className="space-y-4">
            {availabilities.map((slot) => (
              <div key={slot.id} className={`flex items-center justify-between p-4 rounded-lg border ${slot.isActive ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50 opacity-60'}`}>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-blue-500" />
                    <span>{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-blue-500" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={18} className="text-blue-500" />
                    <span>{slot.currentBookings} / {slot.maxStudents} Booked</span>
                  </div>
                </div>
                
                {slot.isActive && (
                  <button 
                    onClick={() => handleDelete(slot.id)}
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
    </div>
  );
};

export default AvailabilitySettings;
