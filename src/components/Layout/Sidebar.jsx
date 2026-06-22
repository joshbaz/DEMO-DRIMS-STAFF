import React, { useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGetSupervisorProfile, useGetUnreadMessageCount } from '../../store/tanstackStore/services/queries';
import { toast } from 'sonner';
import { 
  RiUserLine, 
  RiLogoutBoxRLine,
  RiDashboardLine,
  RiUserLine as RiStudentsLine,
  RiTableLine,
  RiMessage2Line,
  RiNotification3Line,
  RiSettings5Line,
  RiFileTextLine,
  RiCalendarLine
} from 'react-icons/ri';

const otherNavItems = [
  // { name: 'Notifications', path: '/notifications', icon: RiNotification3Line },
  { name: 'Settings', path: '/settings', icon: RiSettings5Line },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: profileData } = useGetSupervisorProfile();
  const { data: unreadData } = useGetUnreadMessageCount();
  
  const unreadCount = unreadData?.unreadCount || 0;
  
  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
    { name: 'Students Management', path: '/students', icon: RiStudentsLine },
    { name: 'Grade Management', path: '/grades', icon: RiTableLine },
    { name: 'Documents', path: '/documents', icon: RiFileTextLine },
    { name: 'Appointments', path: '/appointments', icon: RiCalendarLine },
    { name: 'Direct Messages', path: '/direct-messages', icon: RiMessage2Line, badge: unreadCount },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const getLinkClassName = useCallback(({ isActive }) => {
    return `flex items-center px-3 py-2 min-h-[40px] gap-2 text-xs font-[Inter-Medium] rounded-md ${
      isActive
        ? "!text-[#23388F]  bg-[#ECF6FB] [&_svg]:opacity-100 [&_span]:!text-[#23388F]"
        : "text-gray-400   hover:bg-[#ECF6FB]  [&_span]:text-gray-700"
    }`;
  }, []);

  return (
    <aside className="w-64 min-h-screen border-r border-[#E5E7EB] flex flex-col bg-white">
      {/* Logo Section */}
      <div className="py-4 px-4 border-b border-[#E5E7EB] flex items-center">
        <img src="/Logo2.png" alt="UMI Logo" className="h-14 w-64" />
      </div>

      {/* Profile Section */}
      <div className="h-[56px] py-3 px-4 border-b border-[#E5E7EB] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <RiUserLine className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700">
            {profileData?.supervisor?.name || 'Supervisor'}
          </p>
          <p className="text-xs font-medium text-gray-500">
            {profileData?.supervisor?.designation || 'Supervisor'}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 flex flex-col gap-8">
          {/* Main Activities */}
          <nav className="space-y-1">
            <p className="text-xs font-medium text-gray-400 mb-3">Main Activities</p>
            {mainNavItems.map((item) => {
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={getLinkClassName}
                >
                  <item.icon 
                    className={`w-[18px] h-[18px] `} 
                  />
                  <span className="text-xs font-medium">{item.name}</span>
                  { item.badge > 0 && (
                    <span className="ml-auto border border-[#7DD3FC] text-[#0369A1] text-sm px-2 py-0.5 rounded-full font-semibold bg-white">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Other Options */}
          <nav className="space-y-1">
            <p className="text-xs font-medium text-gray-400 mb-3">Other options</p>
            {otherNavItems.map((item) => {
              
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={getLinkClassName}
                >
                  <item.icon 
                    className={`w-[18px] h-[18px] `} 
                  />
                  <span className="text-xs font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout Section */}
      <div className="h-[72px] p-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleLogout}
          className="flex items-center justify-between gap-3 px-4 py-2 rounded-md w-full text-[#070B1D] hover:bg-[#ECF6FB]"
        >
          <span className="text-xs font-roboto font-medium text-red-700">Logout</span>
          <span className="w-9 h-7 p-2 border border-red-700 bg-red-100 !rounded-md flex items-center justify-center">
            <RiLogoutBoxRLine className="w-5 h-5 text-red-700" />
          </span>         
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;