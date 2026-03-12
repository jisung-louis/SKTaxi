import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import {
  IMGElementContainer,
  IMGElementContentSuccess,
  useIMGElementProps,
  useIMGElementState,
  useRendererProps,
} from 'react-native-render-html';

import { COLORS } from '@/shared/constants/colors';

type ImageRendererProps = Parameters<typeof useIMGElementProps>[0];

const CustomImageRenderer = (props: ImageRendererProps) => {
  const rendererProps = useRendererProps('img') as {
    onImagePress?: (uri: string) => void;
    onImageLoaded?: (payload: { url: string; width: number; height: number }) => void;
  };
  const imgProps = useIMGElementProps(props);
  const state = useIMGElementState(imgProps);
  const hasReportedDimensions = useRef(false);
  const imageUri = state.source?.uri || imgProps.source?.uri;

  useEffect(() => {
    if (
      !hasReportedDimensions.current &&
      state.type === 'success' &&
      imageUri &&
      state.dimensions.width > 0 &&
      state.dimensions.height > 0 &&
      rendererProps?.onImageLoaded
    ) {
      hasReportedDimensions.current = true;
      rendererProps.onImageLoaded({
        url: imageUri,
        width: state.dimensions.width,
        height: state.dimensions.height,
      });
    }
  }, [
    imageUri,
    rendererProps,
    state.dimensions.height,
    state.dimensions.width,
    state.type,
  ]);

  const handlePress = () => {
    if (imageUri && rendererProps?.onImagePress) {
      rendererProps.onImagePress(imageUri);
      return;
    }

    if (imgProps.onPress) {
      imgProps.onPress(undefined as any);
    }
  };

  const aspectRatio =
    state.dimensions.width && state.dimensions.height
      ? state.dimensions.width / state.dimensions.height
      : 1;

  const containerStyle = {
    ...state.containerStyle,
    width: state.dimensions.width,
    height: state.dimensions.height,
    aspectRatio,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: 8,
    backgroundColor: COLORS.background.card,
    overflow: 'hidden' as const,
  };

  if (state.type === 'error') {
    return (
      <IMGElementContainer style={containerStyle} onPress={handlePress}>
        <Text
          style={{
            color: COLORS.text.secondary,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          이미지를 불러올 수 없어요.{'\n'}실제 홈페이지에서 확인해주세요!
        </Text>
      </IMGElementContainer>
    );
  }

  if (state.type === 'success') {
    return (
      <IMGElementContainer style={containerStyle} onPress={handlePress}>
        <IMGElementContentSuccess {...state} />
      </IMGElementContainer>
    );
  }

  return (
    <IMGElementContainer style={containerStyle} onPress={handlePress}>
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
        <ActivityIndicator color={COLORS.accent.green} size="small" />
      </View>
    </IMGElementContainer>
  );
};

export default CustomImageRenderer;
