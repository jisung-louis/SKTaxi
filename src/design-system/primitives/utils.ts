import type { ViewStyle } from 'react-native';

import { v2Shadow } from '../foundation';

type V2ShadowTokenName = keyof typeof v2Shadow;

export const resolveV2Shadow = (tokenName: V2ShadowTokenName): ViewStyle => {
  const shadowLayers = v2Shadow[tokenName].layers;
  const terminalLayer = shadowLayers[shadowLayers.length - 1];
  const maxBlur = Math.max(...shadowLayers.map((layer) => layer.blur));
  const maxYOffset = Math.max(...shadowLayers.map((layer) => layer.y));
  const maxOpacity = Math.max(...shadowLayers.map((layer) => layer.opacity));

  return {
    shadowColor: terminalLayer.color,
    shadowOffset: {
      width: terminalLayer.x,
      height: maxYOffset,
    },
    shadowOpacity: maxOpacity,
    shadowRadius: Math.max(1, maxBlur / 2),
    elevation: Math.max(2, Math.round((maxBlur + maxYOffset) / 4)),
  };
};

export const PRESSED_STATE_STYLE: ViewStyle = {
  opacity: 0.72,
};

export const DISABLED_STATE_STYLE: ViewStyle = {
  opacity: 0.48,
};
