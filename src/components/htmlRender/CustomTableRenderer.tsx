/**
 * @deprecated
 */

import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { TNodeChildrenRenderer } from 'react-native-render-html';
import { COLORS } from '../../constants/colors';

type TableCell = {
  node: any;
  colSpan: number;
  rowSpan: number;
  startCol: number;
};

type TableRow = {
  cells: TableCell[];
};

const MIN_COL_WIDTH = 140; // px
const BASE_ROW_HEIGHT = 44; // px (rowSpan 배수를 위해 고정 높이 사용)

function parseIntAttr(value: any, fallback: number) {
  const n = parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function collectRows(tableTNode: any): any[] {
  const tag = (tableTNode?.tagName || '').toLowerCase();
  if (tag !== 'table') return [];

  const children: any[] = tableTNode?.children || [];
  const tbody = children.find((c: any) => (c?.tagName || '').toLowerCase() === 'tbody');
  const scope = tbody || tableTNode;
  const scopeChildren: any[] = scope?.children || [];
  const rows = scopeChildren.filter((c: any) => (c?.tagName || '').toLowerCase() === 'tr');
  return rows;
}

function buildGrid(rowsTNodes: any[]): { rows: TableRow[]; numCols: number } {
  const rows: TableRow[] = [];
  let maxCols = 0;
  const occupied: number[] = [];

  rowsTNodes.forEach((trNode) => {
    // decrement existing occupied (rowSpan 진행)
    for (let i = 0; i < occupied.length; i++) {
      if (occupied[i] > 0) occupied[i] -= 1;
    }

    const trChildren: any[] = (trNode?.children || []).filter(
      (c: any) => ['td', 'th'].includes((c?.tagName || '').toLowerCase())
    );

    const rowCells: TableCell[] = [];
    let colCursor = 0;

    const ensureLen = (len: number) => {
      while (occupied.length < len) occupied.push(0);
    };

    trChildren.forEach((cellNode) => {
      const colSpan = parseIntAttr(cellNode?.attributes?.colspan, 1);
      const rowSpan = parseIntAttr(cellNode?.attributes?.rowspan, 1);

      // advance to next free col
      while (occupied[colCursor] > 0) colCursor += 1;

      ensureLen(colCursor + colSpan);

      // mark occupied for rowSpan across the spanned columns
      // NOTE: we set remaining blocks including the NEXT row count.
      // Because we decrement at the START of each subsequent row, we must
      // store `rowSpan` (not rowSpan-1) so the next row remains blocked.
      if (rowSpan > 1) {
        for (let c = colCursor; c < colCursor + colSpan; c++) {
          occupied[c] = Math.max(occupied[c], rowSpan);
        }
      }

      rowCells.push({ node: cellNode, colSpan, rowSpan, startCol: colCursor });
      colCursor += colSpan;
    });

    maxCols = Math.max(maxCols, colCursor);
    rows.push({ cells: rowCells });
  });

  return { rows, numCols: maxCols };
}

const CustomTableRenderer = (props: any) => {
  const rowsTNodes = useMemo(() => collectRows(props?.tnode), [props?.tnode]);
  const grid = useMemo(() => buildGrid(rowsTNodes), [rowsTNodes]);

  const tableWidth = Math.max(grid.numCols, 1) * MIN_COL_WIDTH;
  const numRows = rowsTNodes.length;
  const tableHeight = Math.max(numRows, 1) * BASE_ROW_HEIGHT;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
      <View
        style={{
          width: tableWidth,
          height: tableHeight,
          borderWidth: 1,
          borderColor: COLORS.border.light,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: COLORS.background.card,
          position: 'relative',
        }}
      >
        {grid.rows.map((row, rIdx) =>
          row.cells.map((cell, cIdx) => {
            const cellWidth = cell.colSpan * MIN_COL_WIDTH;
            const cellHeight = Math.max(cell.rowSpan, 1) * BASE_ROW_HEIGHT;
            const isHeader = (cell.node?.tagName || '').toLowerCase() === 'th';
            const hasChildren = Array.isArray(cell.node?.children) && cell.node.children.length > 0;
            const left = cell.startCol * MIN_COL_WIDTH;
            const top = rIdx * BASE_ROW_HEIGHT;
            const isMultiRow = cell.rowSpan > 1;
            const verticalJustify = isMultiRow ? 'flex-start' : 'center';
            return (
              <View
                key={`td-${rIdx}-${cIdx}`}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: cellWidth,
                  height: cellHeight,
                  outlineWidth: 1,
                  outlineColor: COLORS.border.dark,
                  paddingHorizontal: 8,
                  paddingVertical: isMultiRow ? 4 : 6,
                  justifyContent: verticalJustify,
                  alignItems: 'flex-start',
                  backgroundColor: isHeader ? COLORS.background.surface : COLORS.background.card,
                  overflow: 'hidden',
                }}
                onLayout={(event) => {
                  if (isMultiRow) {
                    console.log('multi-row cell layout', event.nativeEvent.layout.height);
                  }
                }}
              >
                {hasChildren ? (
                  isMultiRow ? (
                    <View style={{ flex: 1, alignSelf: 'stretch', justifyContent: 'center' }}>
                      <TNodeChildrenRenderer tnode={cell.node as any} disableMarginCollapsing />
                    </View>
                  ) : (
                    <TNodeChildrenRenderer tnode={cell.node as any} disableMarginCollapsing />
                  )
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default CustomTableRenderer;


