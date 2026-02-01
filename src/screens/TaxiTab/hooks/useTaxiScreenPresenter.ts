// SKTaxi: 택시 화면 프레젠터 훅 (SRP 분리)
// TaxiScreen의 비즈니스 로직 담당

import { useState, useRef, useEffect, useCallback } from 'react';
import { Platform, Alert, Linking, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, withTiming, interpolate, Extrapolation, useAnimatedStyle } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

import { TaxiStackParamList } from '../../../navigations/types';
import { useCurrentLocation, requestLocationPermission } from '../../../hooks/common/useCurrentLocation';
import { useParties, useMyParty } from '../../../hooks/party';
import { useTaxiBottomSheet } from './useTaxiBottomSheet';
import { usePartySelection } from './usePartySelection';
import { useJoinRequestCount } from '../../../contexts/JoinRequestContext';

type TaxiScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'TaxiMain'>;

export function useTaxiScreenPresenter() {
    const navigation = useNavigation<TaxiScreenNavigationProp>();
    const mapRef = useRef<MapView | null>(null);
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    // Hooks
    const { location, loading, refresh } = useCurrentLocation();
    const { parties } = useParties();
    const { hasParty, partyId, loading: myPartyLoading } = useMyParty();
    const { joinRequestCount } = useJoinRequestCount();
    const {
        bottomSheetRef, bottomSheetIndex, snapPoints, handleChange,
        toggleBottomSheet, animatedPosition, animatedIndex,
        DEFAULT_SNAP_POINTS
    } = useTaxiBottomSheet();
    const { selectedPartyId, handleCardPress } = usePartySelection(mapRef, location);

    // States
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    // Animations
    const screenTranslateY = useSharedValue(0);
    const mapOpacity = useSharedValue(0);
    const opacity = useSharedValue(1);

    const isLocationValid = !!(
        location &&
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude)
    );

    // Effects
    useEffect(() => {
        screenTranslateY.value = withTiming(isFocused ? 0 : 0, { duration: 200 });
    }, [isFocused]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                refresh && refresh();
            }
        });
        return () => sub.remove();
    }, [refresh]);

    // 남은 시간 계산 및 업데이트
    const calculateTimeRemaining = useCallback((departureTime: string) => {
        const now = new Date();
        const departure = new Date(departureTime);
        const diffMs = departure.getTime() - now.getTime();

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;

        if (diffMs <= 0) {
            return `출발 시간이 ${-diffMinutes}분 지났어요`;
        }

        if (diffHours > 0) {
            return `출발 시간이 ${diffHours}시간 ${remainingMinutes}분 남았어요`;
        } else {
            return `출발 시간이 ${diffMinutes}분 남았어요`;
        }
    }, []);

    useEffect(() => {
        if (hasParty && partyId) {
            const myParty = parties.find(p => p.id === partyId);
            if (myParty?.departureTime) {
                setTimeRemaining(calculateTimeRemaining(myParty.departureTime));

                const interval = setInterval(() => {
                    setTimeRemaining(calculateTimeRemaining(myParty.departureTime));
                }, 60000);

                return () => clearInterval(interval);
            }
        } else {
            setTimeRemaining('');
        }
    }, [hasParty, partyId, parties, calculateTimeRemaining]);

    // Handlers
    const openAppSettings = async () => {
        try {
            await Linking.openSettings();
        } catch (error) {
            Alert.alert('오류', '설정 앱을 열 수 없습니다.');
        }
    };

    const handleLocationPermissionRequest = async () => {
        try {
            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                const message = Platform.OS === 'android'
                    ? '위치 권한을 허용해주세요.'
                    : '위치 → \'앱을 사용하는 동안\'으로 설정해주세요.';

                Alert.alert(
                    '위치 권한이 필요해요',
                    message,
                    [
                        { text: '취소', style: 'cancel' },
                        { text: '설정으로 이동', onPress: openAppSettings }
                    ]
                );
            }
        } catch (error) {
            console.error('위치 권한 요청 중 에러:', error);
            const message = Platform.OS === 'android'
                ? '위치 권한을 허용해주세요.'
                : '위치 → \'앱을 사용하는 동안\'으로 설정해주세요.';

            Alert.alert(
                '위치 권한이 필요해요',
                message,
                [
                    { text: '취소', style: 'cancel' },
                    { text: '설정으로 이동', onPress: openAppSettings }
                ]
            );
        }
    };

    const navigateToChat = () => {
        if (partyId) {
            navigation.navigate('Chat', { partyId });
        }
    };

    const navigateToRecruit = () => {
        navigation.navigate('Recruit');
    };

    const handleMapReady = () => {
        mapOpacity.value = withTiming(1, { duration: 200 });
    };

    // Animated Styles
    const timeRemainingAnimatedStyle = useAnimatedStyle(() => {
        const opacityValue = interpolate(
            animatedPosition.value,
            [DEFAULT_SNAP_POINTS * 0.7, 0],
            [1, 0],
            Extrapolation.CLAMP
        );

        const scale = interpolate(
            animatedPosition.value,
            [DEFAULT_SNAP_POINTS * 0.7, 0],
            [1, 0.8],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            animatedPosition.value,
            [DEFAULT_SNAP_POINTS * 0.7, 0],
            [0, -20],
            Extrapolation.CLAMP
        );

        return {
            opacity: opacityValue,
            transform: [
                { scale },
                { translateY }
            ],
        };
    });

    return {
        mapRef,
        location,
        loading,
        isLocationValid,
        parties,
        selectedPartyId,
        bottomSheetRef,
        snapPoints,
        bottomSheetIndex,
        animatedPosition,
        animatedIndex,
        handleChange,
        toggleBottomSheet,
        handleCardPress,
        handleLocationPermissionRequest,
        handleMapReady,
        navigateToChat,
        navigateToRecruit,
        hasParty,
        partyId,
        myPartyLoading,
        joinRequestCount,
        timeRemaining,
        insets,
        screenTranslateY,
        mapOpacity,
        opacity,
        timeRemainingAnimatedStyle,
    };
}
