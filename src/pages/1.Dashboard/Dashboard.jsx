import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useGetDashboardStats,
  useGetSupervisorProfile,
  useGetRecentMessages,
  useGetAssignedStudents,
  useGetStatusStatistics
} from "../../store/tanstackStore/services/queries";
import DashboardStats from "./DashboardStats";
import DashboardDirectMessages from "./DashboardDirectMessages";
import DashboardStatusReportChat from "./DashboardStatusReportChat";
import DashboardRecentlyAddedTable from "./DashboardRecentlyAddedTable";

const STATUS_COLORS = ["#22C55E", "#F59E42", "#FACC15", "#6366F1", "#F43F5E"];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStatusCategory, setSelectedStatusCategory] = useState('main');

  const { data: profileData, isLoading: profileLoading } = useGetSupervisorProfile();
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStats();
  const { data: messagesData, isLoading: messagesLoading } = useGetRecentMessages();
  const { data: studentsData, isLoading: studentsLoading } = useGetAssignedStudents();
  const { data: statusStatsData, isLoading: statusStatsLoading } = useGetStatusStatistics(selectedStatusCategory);

  // Transform messages data
  const messages = useMemo(() => {
    if (!messagesData?.conversations) return [];

    return messagesData.conversations.slice(0, 3).map((conversation, index) => {
      const lastMessage = conversation.lastMessage;
      // Use the otherParticipant object that the API already provides
      const otherParticipant = conversation.otherParticipant;

      // Generate initials from name
      const getInitials = (name) => {
        if (!name) return "?";
        const nameParts = name.split(' ');
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
        return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      };

      // Cycle through colors
      const colors = [
        "bg-pink-100 text-pink-700",
        "bg-green-100 text-green-700",
        "bg-blue-100 text-blue-700",
        "bg-purple-100 text-purple-700",
        "bg-yellow-100 text-yellow-700"
      ];

      return {
        sender: otherParticipant?.name || "Unknown",
        initials: getInitials(otherParticipant?.name),
        message: lastMessage?.text ?
          (lastMessage.text.length > 50 ? lastMessage.text.substring(0, 50) + "..." : lastMessage.text) :
          "No message preview",
        time: lastMessage?.createdAt ?
          new Date(lastMessage.createdAt).toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) :
          "N/A",
        color: colors[index % colors.length]
      };
    });
  }, [messagesData, user?.id]);

  // Transform status statistics data for chart
  const statusChartData = useMemo(() => {
    if (!statusStatsData || !Array.isArray(statusStatsData)) {
      // Fallback to stats data if status statistics aren't available
      if (statsData?.stats && selectedStatusCategory === 'main') {
        return [
          {
            value: parseInt(statsData.stats.normalProgress) || 0,
            color: '#14B8A6',
            label: 'Normal Progress',
            border: '#0F766E',
            bg: '#ccfbf1'
          },
          {
            value: parseInt(statsData.stats.workshop) || 0,
            color: '#B45309',
            label: 'Workshop',
            border: '#b45309',
            bg: '#fffbeb'
          },
          {
            value: parseInt(statsData.stats.underExamination) || 0,
            color: '#0369A1',
            label: 'Under Examination',
            border: '#0369A1',
            bg: '#f0f9ff'
          },
        ];
      }
      return [];
    }

    return statusStatsData.map((status, index) => ({
      value: status.students || 0,
      color: status.fill || STATUS_COLORS[index % STATUS_COLORS.length],
      label: status.status || 'Unknown Status',
      border: status.fill || STATUS_COLORS[index % STATUS_COLORS.length],
      bg: `${status.fill || STATUS_COLORS[index % STATUS_COLORS.length]}20`
    }));
  }, [statusStatsData, statsData, selectedStatusCategory]);

  // Transform recently added students data
  const recentlyAddedStudents = useMemo(() => {
    if (!studentsData?.students) return [];

    // Sort by creation date and take the most recent 6
    return studentsData.students
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(student => ({
        id: student.id,
        name: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
        campus: student.campus?.name || 'Unknown Campus',
        category: student.programLevel || 'Unknown Program',
        status: student.statuses?.[0]?.definition?.name || 'No Status'
      }));
  }, [studentsData]);


  const statValues = useMemo(() => ({
    assignedStudentsCount: parseInt(statsData?.stats?.assignedStudentsCount) || 0,
    workshopCount: parseInt(statsData?.stats?.workshop) || 0,
    normalProgressCount: parseInt(statsData?.stats?.normalProgress) || 0,
    underExaminationCount: parseInt(statsData?.stats?.underExamination) || 0
  }), [statsData]);

  // Navigation handlers
  const handleViewMoreMessages = () => {
    navigate('/direct-messages');
  };

  const handleViewMoreStudents = () => {
    navigate('/students');
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50  ">
      {/* Header */}
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[64px]">
        <p className="text-sm font-medium text-gray-900">Supervisor Portal</p>
        <p className="text-sm font-medium text-gray-600">Digital Research Information Management System</p>
      </div>
      {/* Horizontal Line */}
      <div className="my-6 border-t w-full border-gray-200"></div>
      {/* Dashboard Title and Last Login */}
      <div className="flex items-center justify-between p-6 pb-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-xs text-gray-500">
          Last login : {profileData?.supervisor?.loggedInAt ?
            new Date(profileData.supervisor.loggedInAt).toLocaleDateString() + ' ' +
            new Date(profileData.supervisor.loggedInAt).toLocaleTimeString() :
            new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
          }
        </div>
      </div>
      {/* Stat Cards */}
      <div className="px-6 mb-6">
        <DashboardStats statValues={statValues} />
      </div>
      {/* Direct Messages & Status Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 mb-6">
        <DashboardDirectMessages
          messages={messages}
          isLoading={messagesLoading}
          onViewMore={handleViewMoreMessages}
        />
        <DashboardStatusReportChat
          chartData={statusChartData}
          statusType={selectedStatusCategory}
          onStatusTypeChange={setSelectedStatusCategory}
          isLoading={statusStatsLoading}
        />
      </div>
      {/* Recently Added Table Section */}
      <div className="px-6 mb-6">
        <DashboardRecentlyAddedTable
          data={recentlyAddedStudents}
          isLoading={studentsLoading}
          onViewMore={handleViewMoreStudents}
        />
      </div>
    </div>
  );
};

export default Dashboard;
