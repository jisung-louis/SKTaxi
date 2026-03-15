// /*
// * 아직 이 파일은 사용하지 않음
// * 일단 react-native-render-html 의 기본 기능을 사용하고 있음 (img, table 제외)
// * 나줃에 inline CSS 적용, 본문과 거의 비슷한 스타일의 공지를 그리기 위해 <p>, <span>, <a>, <table> 등을 RN에서 렌더링 할 수 있도록 함
// * fontSize, fontWeight, color, textAlign, lineHeight, letterSpacing, textAlign 등을 적용할 수 있도록 함
// * 성결대 공지사항 상세 페이지의 html 구조를 전부 파악하고, 필요한 부분만 렌더링 할 수 있도록 함
// */


// import React from 'react';
// import { Text, View, Linking, GestureResponderEvent } from 'react-native';
// import type { CustomTagRendererRecord, CustomRendererProps } from 'react-native-render-html';
// import { parseInlineStyle } from '../../utils/HTMLParser/parseInlineStyle';
// //import CustomTable from '../htmlparser/CustomTable';

// type AnyDomNode = any;

// function serializeAttributes(attribs?: Record<string, string>): string {
//   if (!attribs) return '';
//   const parts: string[] = [];
//   for (const key of Object.keys(attribs)) {
//     const value = attribs[key];
//     if (value == null || value === '') continue;
//     parts.push(`${key}="${String(value).replace(/"/g, '&quot;')}"`);
//   }
//   return parts.length ? ' ' + parts.join(' ') : '';
// }

// function serializeDomNode(node: AnyDomNode): string {
//   if (!node) return '';
//   if (node.type === 'text') {
//     return node.data || '';
//   }
//   if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
//     const tag = node.name || node.tagName || '';
//     const open = `<${tag}${serializeAttributes(node.attribs)}>`;
//     const inner = Array.isArray(node.children)
//       ? node.children.map((c: AnyDomNode) => serializeDomNode(c)).join('')
//       : '';
//     const close = `</${tag}>`;
//     return open + inner + close;
//   }
//   if (Array.isArray(node.children)) {
//     return node.children.map((c: AnyDomNode) => serializeDomNode(c)).join('');
//   }
//   return '';
// }

// function parseMarginFromStyle(styleString?: string): Record<string, number> {
//   if (!styleString) return {};
//   const out: Record<string, number> = {};
//   const getPx = (val?: string) => {
//     if (!val) return undefined as unknown as number;
//     const n = parseFloat(val);
//     return isNaN(n) ? undefined as unknown as number : n;
//   };
//   const map: Record<string, string> = {};
//   styleString
//     .split(';')
//     .map(r => r.trim())
//     .filter(Boolean)
//     .forEach(rule => {
//       const [prop, value] = rule.split(':').map(p => p.trim());
//       if (prop && value) map[prop] = value;
//     });

//   if (map['margin']) {
//     const vals = map['margin'].split(/\s+/);
//     if (vals.length === 1) {
//       const v = getPx(vals[0]);
//       if (v !== undefined) {
//         out.marginTop = v; out.marginRight = v; out.marginBottom = v; out.marginLeft = v;
//       }
//     } else if (vals.length === 2) {
//       const vtb = getPx(vals[0]);
//       const vlr = getPx(vals[1]);
//       if (vtb !== undefined) { out.marginTop = vtb; out.marginBottom = vtb; }
//       if (vlr !== undefined) { out.marginLeft = vlr; out.marginRight = vlr; }
//     } else if (vals.length === 3) {
//       const vt = getPx(vals[0]);
//       const vlr = getPx(vals[1]);
//       const vb = getPx(vals[2]);
//       if (vt !== undefined) out.marginTop = vt;
//       if (vlr !== undefined) { out.marginLeft = vlr; out.marginRight = vlr; }
//       if (vb !== undefined) out.marginBottom = vb;
//     } else if (vals.length === 4) {
//       const vt = getPx(vals[0]);
//       const vr = getPx(vals[1]);
//       const vb = getPx(vals[2]);
//       const vl = getPx(vals[3]);
//       if (vt !== undefined) out.marginTop = vt;
//       if (vr !== undefined) out.marginRight = vr;
//       if (vb !== undefined) out.marginBottom = vb;
//       if (vl !== undefined) out.marginLeft = vl;
//     }
//   }
//   if (map['margin-top']) {
//     const v = getPx(map['margin-top']);
//     if (v !== undefined) out.marginTop = v;
//   }
//   if (map['margin-right']) {
//     const v = getPx(map['margin-right']);
//     if (v !== undefined) out.marginRight = v;
//   }
//   if (map['margin-bottom']) {
//     const v = getPx(map['margin-bottom']);
//     if (v !== undefined) out.marginBottom = v;
//   }
//   if (map['margin-left']) {
//     const v = getPx(map['margin-left']);
//     if (v !== undefined) out.marginLeft = v;
//   }
//   return out;
// }

// function getInlineParsed(tnode: any): Record<string, any> {
//   const styleString: string | undefined = tnode?.domNode?.attribs?.style;
//   const parsed = styleString ? parseInlineStyle(styleString) : {};
//   const marginParsed = parseMarginFromStyle(styleString);
//   return { ...parsed, ...marginParsed };
// }

// const ParagraphRenderer: React.FC<CustomRendererProps<any>> = (props) => {
//     const { TNodeChildrenRenderer, tnode, style } = props;
//     const inline = getInlineParsed(tnode);
//     // p는 블록이지만 텍스트 흐름을 위해 Text 컨테이너 사용
//     return (
//       <Text style={[style as any, inline]}>
//         <TNodeChildrenRenderer tnode={tnode} />
//       </Text>
//     );
//   };

// const SpanRenderer: React.FC<CustomRendererProps<any>> = (props) => {
//   const { TNodeChildrenRenderer, tnode, style } = props;
//   const inline = getInlineParsed(tnode);
//   return (
//     <Text style={[style as any, inline]}>
//       <TNodeChildrenRenderer tnode={tnode} />
//     </Text>
//   );
// };


// const AnchorRenderer: React.FC<CustomRendererProps<any>> = (props) => {
//   const { TNodeChildrenRenderer, tnode, style } = props;
//   const inline = getInlineParsed(tnode);
//   const href: string | undefined = tnode?.domNode?.attribs?.href;
//   const onPressProp = (props as any)?.sharedProps?.renderersProps?.a?.onPress;
//   const handlePress = (e: GestureResponderEvent) => {
//     if (href) {
//       if (typeof onPressProp === 'function') {
//         onPressProp(e, href, tnode?.domNode?.attribs || {}, '_blank');
//       } else {
//         Linking.openURL(href).catch(() => {});
//       }
//     }
//   };
//   const defaultLinkStyle = { color: '#1A73E8', textDecorationLine: 'underline' as const };
//   return (
//     <Text onPress={handlePress} style={[style as any, defaultLinkStyle, inline]}>
//       <TNodeChildrenRenderer tnode={tnode} />
//     </Text>
//   );
// };

// const TableRenderer: React.FC<CustomRendererProps<any>> = (props) => {
//   const { tnode } = props;
//   const html = serializeDomNode(tnode?.domNode);
//   return (
//     <View style={{ width: '100%' }}>
//       {/* <CustomTable html={html} /> */}
//     </View>
//   );
// };

// export const customRenderers: CustomTagRendererRecord = {
//   span: SpanRenderer,
//   p: ParagraphRenderer,
//   a: AnchorRenderer,
//   table: TableRenderer,
// };

// export default customRenderers;


