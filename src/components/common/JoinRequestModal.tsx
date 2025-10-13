import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

type Props = {
  visible: boolean;
  requesterName: string;
  onAccept: () => void;
  onDecline: () => void;
  onRequestClose: () => void;
};

export const JoinRequestModal: React.FC<Props> = ({ visible, requesterName, onAccept, onDecline, onRequestClose }) => {
  const opacity = useSharedValue(0);
  const DURATION = 200;

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: DURATION });
  }, [visible]);

  // SKTaxi: 버튼 클릭 시 페이드아웃 후 콜백 실행
  const handleClose = (cb: () => void) => {
    opacity.value = withTiming(0, { duration: DURATION });
    setTimeout(() => {
      cb();
    }, DURATION);
  };

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Modal transparent visible={visible} onRequestClose={onRequestClose}>
      <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }, animatedStyle]}>
        <Animated.View style={[{ backgroundColor: COLORS.background.card, padding: 20, borderRadius: 16, width: '84%', borderWidth: 1, borderColor: COLORS.border.default }, animatedStyle]}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accent.green + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="person-add-outline" size={28} color={COLORS.accent.green} />
            </View>
            <Text style={[TYPOGRAPHY.title3, { color: COLORS.text.primary, fontWeight: '700' }]}>동승 요청</Text>
          </View>
          <Text style={[TYPOGRAPHY.body1, { color: COLORS.text.primary, textAlign: 'center', marginBottom: 16 }]}>
            {requesterName}님이 동승 요청을 보냈어요. 수락할까요?
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border.default, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background.primary }}
              onPress={() => handleClose(onDecline)}
            >
              <Text style={[TYPOGRAPHY.body1, { color: COLORS.text.primary }]}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent.green, borderWidth: 1, borderColor: COLORS.border.default }}
              onPress={() => handleClose(onAccept)}
            >
              <Text style={[TYPOGRAPHY.body1, { color: COLORS.text.buttonText, fontWeight: '700' }]}>수락</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};


