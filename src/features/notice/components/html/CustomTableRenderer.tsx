import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { TNodeChildrenRenderer } from 'react-native-render-html';

import { COLORS } from '@/shared/constants/colors';

type TableCell = {
  node: any;
  colSpan: number;
  rowSpan: number;
  startCol: number;
};

type TableRow = {
  cells: TableCell[];
};

const MIN_COL_WIDTH = 140;
const BASE_ROW_HEIGHT = 44;

function parseIntAttr(value: any, fallback: number) {
  const nextValue = parseInt(String(value ?? ''), 10);
  return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : fallback;
}

function collectRows(tableTNode: any): any[] {
  const tag = (tableTNode?.tagName || '').toLowerCase();
  if (tag !== 'table') {
    return [];
  }

  const children: any[] = tableTNode?.children || [];
  const tbody = children.find(
    (child: any) => (child?.tagName || '').toLowerCase() === 'tbody',
  );
  const scope = tbody || tableTNode;
  const scopeChildren: any[] = scope?.children || [];
  return scopeChildren.filter(
    (child: any) => (child?.tagName || '').toLowerCase() === 'tr',
  );
}

function buildGrid(rowsTNodes: any[]): { rows: TableRow[]; numCols: number } {
  const rows: TableRow[] = [];
  let maxCols = 0;
  const occupied: number[] = [];

  rowsTNodes.forEach((trNode) => {
    for (let i = 0; i < occupied.length; i += 1) {
      if (occupied[i] > 0) {
        occupied[i] -= 1;
      }
    }

    const trChildren: any[] = (trNode?.children || []).filter((child: any) =>
      ['td', 'th'].includes((child?.tagName || '').toLowerCase()),
    );

    const rowCells: TableCell[] = [];
    let colCursor = 0;

    const ensureLen = (len: number) => {
      while (occupied.length < len) {
        occupied.push(0);
      }
    };

    trChildren.forEach((cellNode) => {
      const colSpan = parseIntAttr(cellNode?.attributes?.colspan, 1);
      const rowSpan = parseIntAttr(cellNode?.attributes?.rowspan, 1);

      while (occupied[colCursor] > 0) {
        colCursor += 1;
      }

      ensureLen(colCursor + colSpan);

      if (rowSpan > 1) {
        for (let column = colCursor; column < colCursor + colSpan; column += 1) {
          occupied[column] = Math.max(occupied[column], rowSpan);
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
        {grid.rows.map((row, rowIndex) =>
          row.cells.map((cell, cellIndex) => {
            const cellWidth = cell.colSpan * MIN_COL_WIDTH;
            const cellHeight = Math.max(cell.rowSpan, 1) * BASE_ROW_HEIGHT;
            const isHeader = (cell.node?.tagName || '').toLowerCase() === 'th';
            const hasChildren =
              Array.isArray(cell.node?.children) && cell.node.children.length > 0;
            const left = cell.startCol * MIN_COL_WIDTH;
            const top = rowIndex * BASE_ROW_HEIGHT;
            const isMultiRow = cell.rowSpan > 1;

            return (
              <View
                key={`td-${rowIndex}-${cellIndex}`}
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
                  justifyContent: isMultiRow ? 'flex-start' : 'center',
                  alignItems: 'flex-start',
                  backgroundColor: isHeader
                    ? COLORS.background.surface
                    : COLORS.background.card,
                  overflow: 'hidden',
                }}
              >
                {hasChildren ? (
                  isMultiRow ? (
                    <View style={{ flex: 1, alignSelf: 'stretch', justifyContent: 'center' }}>
                      <TNodeChildrenRenderer
                        tnode={cell.node as any}
                        disableMarginCollapsing
                      />
                    </View>
                  ) : (
                    <TNodeChildrenRenderer
                      tnode={cell.node as any}
                      disableMarginCollapsing
                    />
                  )
                ) : null}
              </View>
            );
          }),
        )}
      </View>
    </ScrollView>
  );
};

export default CustomTableRenderer;
