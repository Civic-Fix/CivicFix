import React from 'react'

function cx(...tokens) {
  return tokens.filter(Boolean).join(' ')
}

/**
 * columns: [{ key, header, className, cell?: (row) => ReactNode }]
 * rows: array of objects
 * rowKey: (row, idx) => string | number
 */
function Table({
  columns = [],
  rows = [],
  rowKey = (row, idx) => row?.id ?? idx,
  emptyState = 'No results.',
  className,
  ...props
}) {
  return (
    <div className={cx('overflow-hidden rounded-3xl border border-slate-200 bg-white', className)} {...props}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {columns.map((col) => (
                <th key={col.key} scope="col" className={cx('px-5 py-4', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-slate-700">
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-sm font-bold text-slate-500" colSpan={columns.length || 1}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={rowKey(row, idx)} className="border-t border-slate-100">
                  {columns.map((col) => (
                    <td key={col.key} className={cx('px-5 py-4 align-middle', col.className)}>
                      {col.cell ? col.cell(row) : row?.[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
