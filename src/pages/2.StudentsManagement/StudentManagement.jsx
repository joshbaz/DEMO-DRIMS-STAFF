import React, { useEffect, useMemo, useState } from 'react';
import StudentManagementTable from './StudentManagementTable';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Search } from "lucide-react";
import { useGetAssignedStudents, useGetDashboardStats } from '../../store/tanstackStore/services/queries';
import { Icon } from "@iconify-icon/react";
import StudentManagementTableTabs from './StudentManagementTableTabs';
const categories = ['All Students', 'Masters', 'PhD'];

const StudentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Students');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Query hooks (to be updated in server/queries)
  const { data: studentsData, isLoading, error } = useGetAssignedStudents({
    search: searchTerm,
    category: selectedCategory,
    page: currentPage,
    pageSize,
  });
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetDashboardStats();

  console.log("uganda", studentsData)

  console.log("stats", statsData?.stats)
  // Filtered and paginated students (if not handled by backend)
  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) return [];
    let filtered = studentsData.students;
    if (selectedCategory !== 'All Students') {
      filtered = filtered.filter(s => s.programLevel === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [studentsData, selectedCategory, searchTerm]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Update current page if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, pageSize]);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 pb-0 w-full h-[88px] border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">Supervisor Portal</p>
        <p className="text-sm font-medium text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="text-2xl font-semibold">Students Management</h1>
        <span className="text-sm text-gray-500">Last login: {formattedDate}</span>
      </div>

      {/* Stats */}
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6">
        <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          {statsLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold">{statsData?.stats?.assignedStudentsCount || "0"}</p>
              <h3 className="text-sm font-medium text-gray-500">Assigned Students</h3>
            </>
          )}
        </div>

        <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          {statsLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold">{statsData?.stats?.workshop || "0"}</p>
              <h3 className="text-sm font-medium text-gray-500">Workshop
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Icon
                        icon="tdesign:info-circle-filled"
                        className="w-4 h-4 text-gray-400 pt-1"
                      />
                    </TooltipTrigger>
                    <TooltipContent>Students currently in Workshop</TooltipContent>
                  </Tooltip>
                </TooltipProvider></h3>
            </>
          )}
        </div>

        <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          {statsLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold">{statsData?.stats?.normalProgress || "0"}</p>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                Normal Progress
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Icon
                        icon="tdesign:info-circle-filled"
                        className="w-4 h-4 text-gray-400 pt-1"
                      />
                    </TooltipTrigger>
                    <TooltipContent>Students currently in normal progress</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
            </>
          )}
        </div>

        <div className="bg-[#FDFDFE] border border-[#E5E7EB] p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          {statsLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold">{statsData?.stats?.underExamination || "0"}</p>
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                Under Examination
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Icon
                        icon="tdesign:info-circle-filled"
                        className="w-4 h-4 text-gray-400 pt-1"
                      />
                    </TooltipTrigger>
                    <TooltipContent>Students currently under examination</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
            </>
          )}
        </div>
      </div>

      {/* Tabs, Search, Page Size */}
      <div className="bg-white py-4 rounded-lg shadow-md mx-6 mb-4">
        {/* Tabs */}
        <StudentManagementTableTabs
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          students={studentsData?.students || []}
        />

        {/* Search Input & Page Size Dropdown */}
        <div className="flex justify-between items-center my-4 px-4">
          {/* Search Input */}
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm font-[Inter-Regular] border border-semantic-bg-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>
          {/* Page Size Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-[Inter-Regular] text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 min-w-[55px] py-1 text-sm font-[Inter-Regular] border border-semantic-bg-border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-200 appearance-none"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              {[5, 10, 15, 20, 25].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Students Table */}
        <div className="px-4">
          <StudentManagementTable
            students={paginatedStudents}
            pageSize={pageSize} setPageSize={setPageSize}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;