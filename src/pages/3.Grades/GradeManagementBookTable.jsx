import React, { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify-icon/react";
import { format } from "date-fns";
const getCategoryStyle = (status) => {
  switch (status) {
    case 'PASSED':
      return 'text-[#15803D] bg-[#DCFCE7] border border-[#15803D] rounded-md px-2 py-1 text-xs font-medium';
    case 'FAILED':
      return 'text-[#DC2626] bg-[#FEE2E2] border border-[#DC2626] rounded-md px-2 py-1 text-xs font-medium';
    case 'NOT GRADED':
      return 'text-[#6B7280] bg-[#F3F4F6] border border-[#6B7280] rounded-md px-2 py-1 text-xs font-medium';
    default:
      return 'px-2 py-1';
  }
};

const GradeManagementBookTable = ({
  data,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalCount,
}) => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();
  const [globalFilter, setGlobalFilter] = useState("");
 
  const columns = useMemo(
    () => [
      columnHelper.accessor("bookCode", {
        header: "ID",
        cell: (info) => (
          <div className="text-xs text-primary-500 uppercase font-[Inter-Medium]">
            {info.getValue().toString().padStart(4, '0')}
          </div>
        ),
      }),
      columnHelper.accessor("student", {
        header: "Reg. No.",
        cell: (info) => (
          <div className="capitalize">
            {`${info?.getValue()?.registrationNumber}`}
          
          </div>
        ),
      }),
      columnHelper.accessor("student", {
        header: "Student",
        cell: (info) => (
          <div className="capitalize">
            {info.getValue().fullName}
            <div className="text-xs text-gray-500 lowercase">{info.getValue().email}</div>
          </div>
        ),
      }),
      columnHelper.accessor("submissionDate", {
        header: "Submission Date",
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), "MMM dd, yyyy") : "-",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const currentStatus = info.row.original.statuses?.find(s => s.isCurrent);
          const color = currentStatus?.definition?.color || '#000';
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
            className="capitalize text-xs whitespace-normal font-[Inter-Regular]"
          >
            {currentStatus?.definition?.name?.toLowerCase() || 'Unknown'}
          </span>
          );
        },
      }),
      columnHelper.accessor("averageExamMark", {
        header: "Mark Range",
        cell: (info) => info.getValue() ? `${info.getValue()}%` : "-",
      }),
      columnHelper.accessor("bookGrade", {
        header: "Category",
        cell: (info) => {
          const averageMark = info.row.original.averageExamMark;
          let status = 'NOT GRADED';
          
          if (averageMark !== null && averageMark !== undefined) {
            status = averageMark >= 60 ? 'PASSED' : 'FAILED';
          }

          return (
            <span className={getCategoryStyle(status)}>
              {status}
            </span>
          );
        },
      }),
    
    ],
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageSize: pageSize,
        pageIndex: currentPage - 1,
      },
      globalFilter,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: currentPage - 1,
          pageSize,
        });
        setCurrentPage(newState.pageIndex + 1);
        setPageSize(newState.pageSize);
        localStorage.setItem("pageSize", newState.pageSize.toString());
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });
  return (
    <div className="w-full">
    <div className="flex items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-2 justify-between flex-1">
        <div className="relative  w-1/3">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
            placeholder="Search all columns..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 text-left text-sm font-[Inter-Medium] text-gray-500 capitalize tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                  className="px-3 py-4 whitespace-nowrap text-sm font-[Inter-Regular] text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
      <div className="flex font-[Roboto-Regular] items-center text-sm text-gray-500">
        Showing{" "}
        <span className="font-[Roboto-Medium] mx-1">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
        </span>
        to{" "}
        <span className="font-[Roboto-Medium] mx-1">
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getPrePaginationRowModel().rows.length
          )}
        </span>
        of{" "}
        <span className="font-[Roboto-Medium] mx-1">
          {table.getPrePaginationRowModel().rows.length}
        </span>{" "}
        results
      </div>
      <div className="flex items-center gap-2">
        <button
          className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`w-8 h-8 rounded text-sm ${
                pageNumber === table.getState().pagination.pageIndex + 1
                  ? "bg-blue-50 text-blue-600 font-[Roboto-Medium]"
                  : "text-gray-500"
              }`}
              onClick={() => table.setPageIndex(pageNumber - 1)}
            >
              {pageNumber}
            </button>
          )
        )}
        <button
          className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  </div>
  )
}

export default GradeManagementBookTable