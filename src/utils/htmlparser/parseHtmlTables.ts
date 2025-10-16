import { parseDocument } from 'htmlparser2';
import { Element, ChildNode } from 'domhandler';

/**
 * Extracts all HTML strings of `<table>` elements from the given HTML.
 * @param html The full HTML string to parse.
 * @returns An array of HTML strings, each representing a <table> element.
 */
export function parseHtmlTables(html: string): string[] {
  const document = parseDocument(html);
  const tables: string[] = [];

  function findTables(nodes: any[]) {
    for (const node of nodes) {
      if ((node as Element).type === 'tag' && (node as Element).name === 'table') {
        const tableElement = node as Element;
        tables.push(renderTableHtml(tableElement));
      }

      if ('children' in node && Array.isArray(node.children)) {
        findTables(node.children as any[]);
      }
    }
  }

  findTables((document.children || []) as any[]);
  return tables;
}

/**
 * Serializes a table Element back into an HTML string.
 * @param table The <table> Element to serialize.
 * @returns HTML string of the table.
 */
function renderTableHtml(table: Element): string {
  const serialize = require('dom-serializer').default;
  return serialize(table);
}