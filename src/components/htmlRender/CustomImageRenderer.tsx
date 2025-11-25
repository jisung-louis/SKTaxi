import React, { useEffect, useRef } from 'react';
import { useIMGElementProps, useIMGElementState, useRendererProps, IMGElementContainer, IMGElementContentError, IMGElementContentSuccess } from 'react-native-render-html';
import { COLORS } from '../../constants/colors';
import { View, Text, ActivityIndicator } from 'react-native';

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
        rendererProps?.onImageLoaded({
          url: imageUri,
          width: state.dimensions.width,
          height: state.dimensions.height,
        });
      }
    }, [state.type, imageUri, state.dimensions.width, state.dimensions.height, rendererProps]);

    const handlePress = () => {
      if (imageUri && rendererProps?.onImagePress) {
        rendererProps.onImagePress(imageUri);
      } else if (imgProps.onPress) {
        imgProps.onPress(undefined as any);
      }
    };
  
    const aspectRatio = state.dimensions.width && state.dimensions.height
      ? state.dimensions.width / state.dimensions.height
      : 1;
  
    // Error fallback
    if (state.type === 'error') {
      return (
        <IMGElementContainer style={{
          ...state.containerStyle,
          width: state.dimensions.width,
          height: state.dimensions.height,
          aspectRatio: aspectRatio,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: COLORS.border.default,
          borderRadius: 8,
          padding: 8,
          backgroundColor: COLORS.background.card,
          overflow: 'hidden',
        }}
        onPress={handlePress}
        >
        <Text style={{ color: COLORS.text.secondary, fontStyle: 'italic', textAlign: 'center' }}>
          이미지를 불러올 수 없어요.{'\n'}실제 홈페이지에서 확인해주세요!
        </Text>
        </IMGElementContainer>
      );
    }
  
    // Success state
    if (state.type === 'success') {
      return (
        <IMGElementContainer
          style={{
            ...state.containerStyle,
            aspectRatio: aspectRatio,
            width: state.dimensions.width,
            height: state.dimensions.height,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.border.default,
            borderRadius: 8,
            padding: 8,
            backgroundColor: COLORS.background.card,
            overflow: 'hidden',
          }}
          onPress={handlePress}
        >
          <IMGElementContentSuccess {...state} />
        </IMGElementContainer>
      );
    }

    // Loading spinner
    return (
      <IMGElementContainer
        style={{
          ...state.containerStyle,
          width: state.dimensions.width,
          height: state.dimensions.height,
          aspectRatio: aspectRatio,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: COLORS.border.default,
          borderRadius: 8,
          padding: 8,
          backgroundColor: COLORS.background.card,
          overflow: 'hidden',
        }}
        onPress={handlePress}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
          <ActivityIndicator color={COLORS.accent.green} size="small" />
        </View>
      </IMGElementContainer>
    );
  };

export default CustomImageRenderer;