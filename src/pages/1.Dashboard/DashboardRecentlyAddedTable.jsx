import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

const DashboardRecentlyAddedTable = ({ data = [], isLoading = false, isError = false, onViewMore }) => {
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] = useState({
    fullname: true,
    email: true,
    category: true,
    campus: true,
    status: true,
  });

  const columns = [
    {
      accessorKey: "fullname",
      header: () => <span className="text-sm">Fullname</span>,
      cell: (info) => {
        return <div className="text-sm capitalize">{`${info?.row?.original?.fullName || info?.row?.original?.name || ""}`}</div>;
      },
    },

    {
      accessorKey: "campus",
      header: () => <span className="text-sm">Campus</span>,
      cell: (info) => <div className="text-sm">{info?.row?.original?.campus?.name || info?.row?.original?.campus}</div>,
    },

    {
      accessorKey: "category",
      header: () => <span className="text-sm">Category</span>,
      cell: (info) => (
        <div className="inline-flex h-[24px] capitalize rounded-md border py-[4px] px-[9px] bg-[#FDD388] items-center justify-center whitespace-nowrap text-sm">
          {info?.row?.original?.programLevel || info?.row?.original?.category}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <span className="text-sm">Status</span>,
      cell: (info) => {
        // Find the current status from the student's statuses array
        const currentStatus = info.row.original.statuses?.find(status => status.isCurrent)?.definition?.name || info.row.original.status || "Unknown";

        const color = info.row.original.statuses?.find(status => status.isCurrent)?.definition?.color || '#6B7280';

        return (
          <div
            className={`h-[24px] rounded-md border py-[4px] w-max px-2 flex items-center justify-center whitespace-nowrap text-sm`}
            style={{
              backgroundColor: `${color}20`,
              borderColor: color,
              color: color,
            }}
          >
            {currentStatus}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <Card className="flex flex-col h-full shadow-sm rounded-lg border-0 bg-white">
      <CardHeader className="flex flex-row justify-between items-start gap-6 space-y-0 py-5">
        <CardTitle className="text-lg font-medium text-gray-900">
          Recently Added
        </CardTitle>

        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={onViewMore}
            className="text-sm text-white bg-[#23388F] hover:bg-[#23388F]/80 flex items-center gap-1 px-3 py-1.5 rounded"
          >
            <span>View More</span>
            <ChevronsUpDown className="text-white w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-red-500">
            Error loading student data. Please try again.
          </div>
        ) : data && data.length > 0 ? (
          /* Table Structure */
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/students/profile/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                        {cell.column.columnDef.cell
                          ? flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                          : cell.renderCell()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-sm font-medium">No recent students</div>
            <div className="text-xs text-gray-400 mt-1">Recently assigned students will appear here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentlyAddedTable;