import React from 'react';

interface Column {
  header: string;
  key: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  sticky?: 'left' | 'right';
  stickyOffset?: number;
  stickyZIndex?: number;
  stickyHeaderBgClass?: string;
  stickyCellBgClass?: string;
  stickyShadowClass?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, className = '' }) => {
  const getStickyMeta = (
    column: Column,
    type: 'header' | 'cell'
  ) => {
    if (!column.sticky) {
      return {
        className: '',
        style: undefined as React.CSSProperties | undefined
      };
    }

    const zIndex = column.stickyZIndex ?? (type === 'header' ? 30 : 20);
    const bgClass = type === 'header'
      ? (column.stickyHeaderBgClass || 'bg-slate-50')
      : (column.stickyCellBgClass || 'bg-white');
    const shadowClass = column.stickyShadowClass || (
      column.sticky === 'left'
        ? 'shadow-[1px_0_0_0_rgba(226,232,240,1)]'
        : 'shadow-[-1px_0_0_0_rgba(226,232,240,1)]'
    );
    const style: React.CSSProperties = {
      zIndex
    };

    if (column.sticky === 'left') {
      style.left = column.stickyOffset ?? 0;
    } else {
      style.right = column.stickyOffset ?? 0;
    }

    return {
      className: `sticky ${bgClass} ${shadowClass}`,
      style
    };
  };

  return (
    <div className={`overflow-hidden rounded-xl lg:rounded-2xl border border-slate-200 bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
            <tr>
              {columns.map((column, index) => {
                const stickyMeta = getStickyMeta(column, 'header');
                return (
                  <th
                    key={index}
                    style={stickyMeta.style}
                    className={`px-6 py-4 text-left text-sm font-bold text-slate-800 uppercase tracking-wide ${stickyMeta.className} ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group">
                {columns.map((column, colIndex) => {
                  const stickyMeta = getStickyMeta(column, 'cell');
                  return (
                    <td
                      key={colIndex}
                      style={stickyMeta.style}
                      className={`px-6 py-4 text-sm text-slate-900 ${stickyMeta.className} ${column.className || ''} group-hover:shadow-sm transition-shadow duration-300`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-8 lg:p-12 text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm lg:text-base text-slate-500 font-medium">Tidak ada data</p>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">Data akan muncul setelah ditambahkan</p>
        </div>
      )}
    </div>
  );
};

export default Table;
