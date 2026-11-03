import type { ReactNode } from 'react';

interface TableEmptyRowProps {
  colSpan: number;
  children: ReactNode;
}

export function TableEmptyRow({ colSpan, children }: TableEmptyRowProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-primary-foreground h-80 px-4 text-center align-middle text-sm font-normal"
      >
        {children}
      </td>
    </tr>
  );
}
