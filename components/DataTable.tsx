

import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import type { RowData, ColumnConfig } from '../types';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, EyeOffIcon } from './Icons';

interface DataTableProps {
  data: RowData[];
  columnsConfig: ColumnConfig[];
  title: string;
}

const DebouncedInput: React.FC<{
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>> = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  );
}

const DataTable: React.FC<DataTableProps> = ({ data, columnsConfig, title }) => {
  const columns = useMemo<ColumnDef<RowData>[]>(() =>
    columnsConfig.map(config => ({
      accessorKey: config.label,
      header: config.label,
      cell: ({ getValue }) => {
        const value = getValue();
        if (typeof value === 'number') {
          return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
        }
        return String(value ?? '');
      }
    })),
    [columnsConfig]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const setPrintPageSize = () => setPagination(p => ({ ...p, pageSize: data.length }));
    const setDefaultPageSize = () => setPagination(p => ({ ...p, pageSize: 10 }));

    const checkPrintMode = () => {
      if (document.body.classList.contains('print-preview-mode')) {
        setPrintPageSize();
      } else {
        setDefaultPageSize();
      }
    };
    
    checkPrintMode();

    const observer = new MutationObserver(checkPrintMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('beforeprint', setPrintPageSize);
    window.addEventListener('afterprint', setDefaultPageSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeprint', setPrintPageSize);
      window.removeEventListener('afterprint', setDefaultPageSize);
    };
  }, [data.length]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col h-full">
      <h3 className="print-title">{title}</h3>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 noprint">
        <div className="relative w-full md:w-1/3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            placeholder="Search all columns..."
            data-tooltip="Search across all columns in the table."
          />
        </div>
        <div className="relative">
          <div className="group">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md" data-tooltip="Select which columns to show or hide in this table.">
                <EyeOffIcon /> Hide Columns
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10 p-2">
                {table.getAllLeafColumns().map(column => (
                    <label key={column.id} className="flex items-center gap-2 p-2 hover:bg-[var(--bg-contrast-hover)] rounded-md cursor-pointer">
                        <input
                            {...{
                                type: 'checkbox',
                                checked: column.getIsVisible(),
                                onChange: column.getToggleVisibilityHandler(),
                            }}
                            className="form-checkbox h-4 w-4 rounded bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bg-accent)] focus:ring-[var(--ring-color)]"
                        />
                        {column.id}
                    </label>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto rounded-lg border border-[var(--border-color)] data-table-scroll-container">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--bg-contrast)] sticky top-0">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} scope="col" className="px-6 py-3">
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none flex items-center gap-2'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUpIcon />,
                        desc: <ChevronDownIcon />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="bg-transparent border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-contrast-hover)]">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-4 noprint">
        <span className="text-sm text-[var(--text-secondary)]">
            Page{' '}
            <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
        </span>
        <div className="flex items-center gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 bg-[var(--bg-contrast)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-contrast-hover)]">
                <ChevronLeftIcon />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 bg-[var(--bg-contrast)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-contrast-hover)]">
                <ChevronRightIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;