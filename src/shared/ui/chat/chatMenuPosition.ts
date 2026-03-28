import {Dimensions} from 'react-native';

interface ResolveChatMenuPositionInput {
  estimatedHeight?: number;
  menuWidth?: number;
  pageX: number;
  pageY: number;
}

export const resolveChatMenuPosition = ({
  estimatedHeight = 112,
  menuWidth = 156,
  pageX,
  pageY,
}: ResolveChatMenuPositionInput) => {
  const window = Dimensions.get('window');
  const horizontalPadding = 12;
  const verticalPadding = 16;
  const minRight = horizontalPadding;
  const maxRight = Math.max(horizontalPadding, window.width - menuWidth - horizontalPadding);
  const rawRight = window.width - pageX - horizontalPadding;
  const rawTop = pageY - 12;

  return {
    right: Math.min(Math.max(rawRight, minRight), maxRight),
    top: Math.min(
      Math.max(rawTop, verticalPadding),
      Math.max(verticalPadding, window.height - estimatedHeight - verticalPadding),
    ),
  };
};
