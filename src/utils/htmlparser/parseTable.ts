

import { parseDocument } from 'htmlparser2';
import { Element } from 'domhandler';

export interface TableCell {
  type: 'td' | 'th';
  content: string;
}

export type TableRow = TableCell[];

export function parseTableFromHtml(html: string): TableRow[] {
  const doc = parseDocument(html);

  const findTables = (node: any): Element[] => {
    const tables: Element[] = [];

    const walk = (n: any) => {
      if (n.type === 'tag' && n.name === 'table') {
        tables.push(n);
      }
      if (n.children) {
        n.children.forEach(walk);
      }
    };

    walk(doc);
    return tables;
  };

  const getText = (node: any): string => {
    if (node.type === 'text') {
      return node.data;
    } else if (node.children) {
      return node.children.map(getText).join('').trim();
    }
    return '';
  };

  const tables = findTables(doc);
  if (tables.length === 0) return [];

  const firstTable = tables[0]; // You can expand this if needed

  const rows: TableRow[] = [];

  const trElements = firstTable.children?.filter(
    (child: any) => child.type === 'tag' && child.name === 'tr'
  ) ?? [];

  for (const tr of trElements) {
    const cells: TableCell[] = [];
    const cellElements = (Array.isArray((tr as any).children) ? (tr as any).children : []).filter(
      (child: any) =>
        child.type === 'tag' && (child.name === 'td' || child.name === 'th')
    ) ?? [];

    for (const cell of cellElements) {
      cells.push({
        type: cell.name as 'td' | 'th',
        content: getText(cell),
      });
    }

    rows.push(cells);
  }

  return rows;
}