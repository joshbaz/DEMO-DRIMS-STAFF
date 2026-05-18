import React, { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const StudentManagementTable = ({ students, pageSize, setPageSize }) => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();
  const [pageIndex, setPageIndex] = useState(0);

  const handleOpenProfile = useCallback((studentId) => {
    navigate(`/students/profile/${studentId}`);
  }, [navigate]);

  // Columns
  const columns = useMemo(() => [
    columnHelper.accessor('fullname', {
      header: 'Fullname',
      cell: ({ row }) => <span className="capitalize">{row.original.fullName}</span>
    }),
    columnHelper.accessor('email', {
      header: 'Email Address'
    }),
    columnHelper.accessor('campus', {
      header: 'Campus',
      cell: ({ row }) => row.original?.campus?.name
    }),
    columnHelper.accessor('schoolCode', {
      header: 'School Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original?.school?.code}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.original?.school?.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ row }) => (
        <span className="bg-[#FDD388] px-2 py-1 rounded-md capitalize">
          {row.original?.programLevel}
        </span>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const currentStatus = row.original.statuses?.find(s => s.isCurrent)?.definition;
        const color = currentStatus?.color || '#000';
        return (
          <span
            style={{
              color: color,
              backgroundColor: `${color}18`,
              border: `1px solid ${color}`,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              display: 'inline-block'
            }}
            className="capitalize"
          >
            {currentStatus?.name?.toLowerCase() || 'Unknown'}
          </span>
        );
      }
    }),
    columnHelper.accessor('timeInStatus', {
      header: 'Time in Status',
      cell: ({ row }) => {
        const currentStatus = row.original.statuses?.find(s => s.isCurrent);
        if (!currentStatus || !currentStatus.startDate) {
          return <span className="text-gray-400">N/A</span>;
        }

        const startDate = new Date(currentStatus.startDate);
        const now = new Date();
        const diffInDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

        let timeDisplay;
        if (diffInDays < 1) {
          timeDisplay = "Today";
        } else if (diffInDays === 1) {
          timeDisplay = "1 day";
        } else if (diffInDays < 30) {
          timeDisplay = `${diffInDays} days`;
        } else if (diffInDays < 365) {
          const months = Math.floor(diffInDays / 30);
          timeDisplay = `${months} ${months === 1 ? 'month' : 'months'}`;
        } else {
          const years = Math.floor(diffInDays / 365);
          const remainingMonths = Math.floor((diffInDays % 365) / 30);
          timeDisplay = `${years} ${years === 1 ? 'year' : 'years'}${remainingMonths > 0 ? `, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : ''}`;
        }

        return (
          <span className="text-sm">
            {timeDisplay}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          className="w-[47px] h-6 rounded border border-[#E5E7EB] text-sm font-[Inter-Regular] text-[#111827] shadow-[0px_1px_2px_0px_#0000000D] hover:bg-gray-50"
          onClick={() => handleOpenProfile(row.original.id)}
        >
          Open
        </button>
      )
    })
  ], [handleOpenProfile]);

  // Pagination
  const pagination = useMemo(() => ({
    pageIndex,
    pageSize
  }), [pageIndex, pageSize]);

  const handlePaginationChange = useCallback(updater => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize });
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    }
  }, [pageIndex, pageSize]);

  // Table Structuring
  const table = useReactTable({
    data: useMemo(() => students || [], [students]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: handlePaginationChange,
  });

  const handlePageChange = useCallback((index) => {
    setPageIndex(index);
  }, []);

  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  return (
    <div>
      <div className="overflow-x-auto bg-white shadow-md rounded-t-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-[#111827] font-[Inter-Medium] text-sm"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 whitespace-nowrap text-[#111827] font-[Inter-Regular] text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-white shadow rounded-br-lg rounded-bl-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm font-[Inter-Regular] text-gray-500">
            Showing {pagination.pageSize * pagination.pageIndex + 1} to{' '}
            {Math.min(
              pagination.pageSize * (pagination.pageIndex + 1),
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} Results
          </div>

          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 border rounded text-sm font-[Inter-Regular] ${!table.getCanPreviousPage() ? "text-gray-400 cursor-not-allowed" : ""}`}
              onClick={handlePreviousPage}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>

            {Array.from({ length: table.getPageCount() }, (_, index) => (
              <button
                key={index}
                className={`px-3 py-1 border rounded text-sm font-[Inter-Regular] ${pageIndex === index ? "bg-blue-50 text-blue-600 border-blue-200" : ""}`}
                onClick={() => handlePageChange(index)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className={`px-3 py-1 border rounded text-sm font-[Inter-Regular] ${!table.getCanNextPage() ? "text-gray-400 cursor-not-allowed" : ""}`}
              onClick={handleNextPage}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentManagementTable
