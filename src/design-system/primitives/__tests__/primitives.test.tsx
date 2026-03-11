import React from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import {
  AppHeader,
  CategoryTag,
  ElevatedCard,
  FilterChip,
  FloatingActionButton,
  GroupedList,
  SectionHeader,
  StatusBadge,
} from '../index';

const renderComponent = (element: React.ReactElement) => {
  let renderer: ReactTestRenderer;

  act(() => {
    renderer = create(element);
  });

  return renderer!;
};

describe('v2 primitives', () => {
  it('renders AppHeader actions and forwards presses', () => {
    const onSearchPress = jest.fn();
    const onBackPress = jest.fn();

    const renderer = renderComponent(
      <AppHeader
        actions={[
          {
            accessibilityLabel: '검색',
            icon: <Text>Q</Text>,
            onPress: onSearchPress,
          },
        ]}
        leftAction={{
          accessibilityLabel: '뒤로가기',
          icon: <Text>{'<'}</Text>,
          onPress: onBackPress,
        }}
        title="공지"
      />,
    );

    expect(renderer.root.findByProps({ children: '공지' })).toBeTruthy();

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: '검색' }).props.onPress();
      renderer.root.findByProps({ accessibilityLabel: '뒤로가기' }).props.onPress();
    });

    expect(onSearchPress).toHaveBeenCalledTimes(1);
    expect(onBackPress).toHaveBeenCalledTimes(1);
  });

  it('renders SectionHeader subtitle and action', () => {
    const onPressAction = jest.fn();

    const renderer = renderComponent(
      <SectionHeader
        actionLabel="시간표"
        onPressAction={onPressAction}
        subtitle="3월 10일 화요일 2주차"
        title="오늘 시간표"
      />,
    );

    expect(renderer.root.findByProps({ children: '오늘 시간표' })).toBeTruthy();
    expect(renderer.root.findByProps({ children: '3월 10일 화요일 2주차' })).toBeTruthy();

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: '시간표' }).props.onPress();
    });
    expect(onPressAction).toHaveBeenCalledTimes(1);
  });

  it('renders FilterChip and propagates selection presses', () => {
    const onPress = jest.fn();

    const renderer = renderComponent(
      <FilterChip label="전체" onPress={onPress} selected />,
    );

    const chipPressable = renderer.root.findByProps({ accessibilityLabel: '전체' });

    expect(renderer.root.findByProps({ children: '전체' })).toBeTruthy();
    expect(chipPressable.props.hitSlop).toEqual({
      bottom: 4,
      left: 4,
      right: 4,
      top: 4,
    });

    act(() => {
      chipPressable.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders CategoryTag with custom colors for unresolved tones', () => {
    const renderer = renderComponent(
      <CategoryTag
        colors={{ background: '#FFF7ED', text: '#EA580C' }}
        label="행사"
        tone="custom"
      />,
    );

    expect(renderer.root.findByProps({ children: '행사' })).toBeTruthy();
  });

  it('renders StatusBadge with caller-provided unread value', () => {
    const renderer = renderComponent(
      <>
        <StatusBadge status="recruiting" variant="pill" />
        <StatusBadge
          accessibilityLabel="읽지 않은 메시지 5개"
          value="5"
          variant="count"
        />
      </>,
    );

    expect(renderer.root.findByProps({ children: '모집중' })).toBeTruthy();
    expect(renderer.root.findByProps({ children: '5' })).toBeTruthy();
  });

  it('renders ElevatedCard as a pressable wrapper', () => {
    const onPress = jest.fn();

    const renderer = renderComponent(
      <ElevatedCard accessibilityLabel="택시 카드" onPress={onPress}>
        <Text>오전 09:00</Text>
      </ElevatedCard>,
    );

    expect(renderer.root.findByProps({ children: '오전 09:00' })).toBeTruthy();

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: '택시 카드' }).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders GroupedList rows and forwards item presses', () => {
    const onPress = jest.fn();

    const renderer = renderComponent(
      <GroupedList
        items={[
          {
            icon: <Text>문서</Text>,
            key: 'posts',
            label: '내가 쓴 글',
            onPress,
          },
        ]}
      />,
    );

    expect(renderer.root.findByProps({ children: '내가 쓴 글' })).toBeTruthy();

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: '내가 쓴 글' }).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders FloatingActionButton and forwards presses', () => {
    const onPress = jest.fn();

    const renderer = renderComponent(
      <FloatingActionButton
        accessibilityLabel="새 글 작성"
        icon={<Text>+</Text>}
        onPress={onPress}
      />,
    );

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: '새 글 작성' }).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
