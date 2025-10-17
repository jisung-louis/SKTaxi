import { useIMGElementProps, useIMGElementState, IMGElementContainer, IMGElementContentError, IMGElementContentSuccess } from 'react-native-render-html';
import { COLORS } from '../../constants/colors';
import { View, Text, ActivityIndicator } from 'react-native';

const CustomImageRenderer = (props: any) => {
    const imgProps = useIMGElementProps(props);
    const state = useIMGElementState(imgProps);
  
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
        onPress={imgProps.onPress}
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
          onPress={imgProps.onPress}
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
        onPress={imgProps.onPress}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
          <ActivityIndicator color={COLORS.accent.green} size="small" />
        </View>
      </IMGElementContainer>
    );
  };

export default CustomImageRenderer;