import React, { useCallback, useMemo, useState } from 'react';
import { Linking, Text } from 'react-native';
import RenderHTML, { domNodeToHTMLString } from 'react-native-render-html';
import { WebView } from 'react-native-webview';

import { COLORS } from '@/shared/constants/colors';

import { normalizeNoticeHtml } from '../model/selectors';
import CustomImageRenderer from './html/CustomImageRenderer';

const TableToWebView = ({
  targetWidth,
  tnode,
}: {
  targetWidth: number;
  tnode: any;
}) => {
  const [height, setHeight] = useState(100);

  const html = useMemo(() => {
    try {
      const inner = domNodeToHTMLString(tnode.domNode as any) || '<div></div>';
      return `
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html, body { margin: 0; padding: 0; background: transparent; }
          table { border-collapse: collapse; }
        </style>
        <div id="wrap">${inner}</div>
      `;
    } catch {
      return '<div></div>';
    }
  }, [tnode]);

  const injectedJavaScript = `
    (function() {
      var TARGET_W = ${Math.max(0, targetWidth)};
      function applyScale() {
        var el = document.getElementById('wrap');
        if (!el) return;
        var naturalW = el.scrollWidth || el.offsetWidth || 0;
        if (!naturalW) return;
        var scale = TARGET_W > 0 ? (TARGET_W / naturalW) : 1;
        el.style.transformOrigin = 'top left';
        el.style.transform = 'scale(' + scale + ')';
        el.style.width = naturalW + 'px';
        var rawH = el.scrollHeight || el.offsetHeight || 0;
        var scaledH = Math.ceil(rawH * scale);
        if (scaledH > 0 && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(String(scaledH));
        }
      }
      function schedule() { setTimeout(applyScale, 0); }
      schedule();
      window.addEventListener('load', schedule);
      try { new ResizeObserver(applyScale).observe(document.body); } catch (_) {}
    })();
    true;
  `;

  const handleMessage = useCallback((event: any) => {
    const nextHeight = Number(event?.nativeEvent?.data);
    if (Number.isFinite(nextHeight) && nextHeight > 0) {
      setHeight(nextHeight);
    }
  }, []);

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      injectedJavaScript={injectedJavaScript}
      onMessage={handleMessage}
      style={{ width: '100%', height }}
      scrollEnabled
    />
  );
};

interface NoticeHtmlContentProps {
  contentWidth: number;
  fallbackText?: string;
  html?: string | null;
  onImageLoaded?: (payload: { url: string; width: number; height: number }) => void;
  onImagePress?: (url: string) => void;
}

export const NoticeHtmlContent = ({
  contentWidth,
  fallbackText,
  html,
  onImageLoaded,
  onImagePress,
}: NoticeHtmlContentProps) => {
  const source = useMemo(() => {
    const normalizedHtml = normalizeNoticeHtml(html);
    return normalizedHtml ? { html: normalizedHtml } : null;
  }, [html]);

  if (!source) {
    if (!fallbackText) {
      return null;
    }

    return (
      <Text style={{ color: COLORS.text.primary, fontSize: 14, lineHeight: 20 }}>
        {fallbackText}
      </Text>
    );
  }

  return (
    <RenderHTML
      contentWidth={contentWidth}
      source={source}
      defaultTextProps={{ selectable: true }}
      baseStyle={{ color: COLORS.text.primary, fontSize: 14, lineHeight: 20 }}
      tagsStyles={{
        td: { fontSize: 10, lineHeight: 14 },
        th: { fontSize: 10, lineHeight: 14 },
      }}
      renderers={{
        img: CustomImageRenderer,
        table: (props) => <TableToWebView {...props} targetWidth={contentWidth} />,
      }}
      renderersProps={{
        a: {
          onPress: (_event: any, href?: string) => {
            if (href) {
              Linking.openURL(href);
            }
            return Promise.resolve();
          },
        },
        img: {
          onImageLoaded,
          onImagePress,
        } as any,
      }}
    />
  );
};
