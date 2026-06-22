import React, { useState } from 'react';
import UpcomingAppointments from './UpcomingAppointments';
import AvailabilitySettings from './AvailabilitySettings';

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[64px]">
        <p className="text-sm font-medium text-gray-900">Supervisor Portal</p>
        <p className="text-sm font-medium text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t w-full border-gray-200"></div>

      {/* Title */}
      <div className="flex flex-col p-6 pb-2">
        <h1 className="text-2xl font-semibold mb-4">Appointments</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Appointments
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'availability'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('availability')}
          >
            Availability Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'upcoming' ? <UpcomingAppointments /> : <AvailabilitySettings />}
      </div>
    </div>
  );
};

export default Appointments;
