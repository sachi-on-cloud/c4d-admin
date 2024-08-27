import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';


function TextFilter({ column }) {
  return (
    <input
      value={column.getFilterValue() || ''}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
    />
  );
}

function Table({ data, columns }) {
  

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: {
      Filter: TextFilter,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <div className="border-b border-blue-gray-50 py-3 px-5 text-left">{flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}</div>
                  <div>
                    {header.column.getCanFilter() ? (
                      flexRender(
                        header.column.columnDef.Filter,
                        header.getContext()
                      )
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
             const className = `p-3 ${index === table.getRowModel().rows.length - 1
                ? "mb-4"
                : "border-b border-blue-gray-50"
                }`;
            return <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={className}>
                   <span className="text-xs font-semibold text-blue-gray-600">
                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span> 
                </td>
              ))}
            </tr>
})}
        </tbody>
      </table>
      <div>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </>
  );
}

export default Table;