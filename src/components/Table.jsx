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
    <div className="table-container">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="thead">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="th">
                  <div className="py-2">{flexRender(
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="tr">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="td">
                  <span className="text-sm font-medium text-blue-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 p-3 border-t border-blue-gray-100 justify-between flex-wrap">
        <button
          className="btn btn-outline text-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="btn btn-outline text-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="btn btn-outline text-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="btn btn-outline text-sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="text-sm text-blue-gray-600">
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
}

export default Table;