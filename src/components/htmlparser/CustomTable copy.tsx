import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parseDocument } from 'htmlparser2';

// domhandler/htmlparser2의 타입이 프로젝트 내 다른 패키지와 충돌하는 경우가 있어
// 강한 타입 대신 AnyNode(= any)로 처리합니다.
type AnyNode = any;

interface TableCell {
  content: string;
  isHeader?: boolean;
}

interface TableRow {
  cells: TableCell[];
}

interface CustomTableProps {
  html: string;
}

const extractTextFromNode = (node: AnyNode): string => {
  if (!node) return '';
  // 텍스트 노드이면 node.data에 텍스트가 있음
  if (node.type === 'text') return (node.data || '').toString();
  // 태그 노드이면 children 순회
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('');
  }
  return '';
};

const CustomTable: React.FC<CustomTableProps> = ({ html }) => {
  const rows: TableRow[] = [];

  try {
    const document = parseDocument(html) as AnyNode;
    const children = document && document.children ? document.children : [];

    // table 엘리먼트 찾기 (첫 번째 테이블만 처리)
    const table = children.find(
      (n: AnyNode) => n && n.type === 'tag' && n.name === 'table'
    ) as AnyNode | undefined;

    if (table && Array.isArray(table.children)) {
      // table 내부의 tr 찾기 (직접 tr을 자식으로 가지는 경우)
      const trs = table.children.filter(
        (n: AnyNode) => n && n.type === 'tag' && n.name === 'tr'
      ) as AnyNode[];

      // 경우에 따라 <tbody> 같은 래퍼가 있을 수 있으므로, tr이 없으면 깊게 탐색
      let effectiveTrs = trs;
      if (effectiveTrs.length === 0) {
        // table 안의 모든 자식 태그들 중 tr을 찾는다 (중첩 허용)
        const findTrsRec = (node: AnyNode, acc: AnyNode[]) => {
          if (!node || !node.children) return;
          node.children.forEach((c: AnyNode) => {
            if (c.type === 'tag' && c.name === 'tr') acc.push(c);
            else findTrsRec(c, acc);
          });
        };
        const acc: AnyNode[] = [];
        findTrsRec(table, acc);
        effectiveTrs = acc;
      }

      effectiveTrs.forEach((tr: AnyNode) => {
        const cells: TableCell[] =
          (tr.children || [])
            .filter(
              (td: AnyNode) =>
                td && td.type === 'tag' && (td.name === 'td' || td.name === 'th')
            )
            .map((td: AnyNode) => {
              // td 내부의 텍스트를 재귀적으로 추출
              const text = (td.children || [])
                .map((child: AnyNode) => extractTextFromNode(child))
                .join('')
                .trim();

              return {
                content: text,
                isHeader: td.name === 'th',
              } as TableCell;
            }) || [];

        rows.push({ cells });
      });
    }
  } catch (e) {
    // 파싱 실패시 로깅
    // 개발 중에는 경고로 남겨두고, 필요시 fallback 처리 가능
    // 예: rows에 빈값 두거나 원본 html을 표시
    // eslint-disable-next-line no-console
    console.warn('Table parse error:', (e as Error).message || e);
  }

  // rows를 렌더링
  return (
    <View style={styles.table}>
      {rows.map((row, rowIndex) => (
        <View
          key={`r-${rowIndex}`}
          style={[styles.row, rowIndex === 0 ? styles.headerRow : null]}
        >
          {row.cells.map((cell, cellIndex) => (
            <View
              key={`c-${rowIndex}-${cellIndex}`}
              style={[
                styles.cell,
                rowIndex === 0 ? styles.headerCell : styles.bodyCell,
              ]}
            >
              <Text
                style={rowIndex === 0 ? styles.headerText : styles.bodyText}
                selectable
                numberOfLines={0}
              >
                {cell.content}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 36,
    justifyContent: 'center',
  },
  headerCell: {
    backgroundColor: '#f9f9f9',
  },
  bodyCell: {
    backgroundColor: '#fff',
  },
  headerText: {
    fontWeight: '700',
  },
  bodyText: {},
});

export default CustomTable;