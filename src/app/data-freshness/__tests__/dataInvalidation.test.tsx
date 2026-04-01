import React from 'react';
import {act, render} from '@testing-library/react-native';

import {
  invalidateData,
  useRefetchOnFocus,
} from '../dataInvalidation';

const mockUseFocusEffect = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (...args: unknown[]) => mockUseFocusEffect(...args),
}));

describe('dataInvalidation', () => {
  beforeEach(() => {
    mockUseFocusEffect.mockReset();
  });

  const flushFocus = async (
    focusEffect?: () => void | (() => void),
  ) => {
    await act(async () => {
      focusEffect?.();
      await Promise.resolve();
    });
  };

  it('invalidated key는 다음 focus에서 한 번만 refetch한다', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    let latestFocusEffect: (() => void | (() => void)) | undefined;

    mockUseFocusEffect.mockImplementation((focusEffect: () => void) => {
      latestFocusEffect = focusEffect;
    });

    const TestComponent = () => {
      useRefetchOnFocus({
        invalidationKey: 'campus.home',
        refetch,
      });

      return null;
    };

    render(<TestComponent />);

    await flushFocus(latestFocusEffect);
    expect(refetch).not.toHaveBeenCalled();

    act(() => {
      invalidateData('campus.home');
    });

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(1);

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('refetch가 실패하면 다음 focus에서 같은 invalidation을 다시 시도한다', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let shouldFail = true;
    const refetch = jest.fn().mockImplementation(() =>
      shouldFail
        ? Promise.reject(new Error('network error'))
        : Promise.resolve(undefined),
    );
    let latestFocusEffect: (() => void | (() => void)) | undefined;

    mockUseFocusEffect.mockImplementation((focusEffect: () => void) => {
      latestFocusEffect = focusEffect;
    });

    const TestComponent = () => {
      useRefetchOnFocus({
        invalidationKey: 'campus.home',
        refetch,
      });

      return null;
    };

    render(<TestComponent />);

    await flushFocus(latestFocusEffect);

    act(() => {
      invalidateData('campus.home');
    });

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(1);

    shouldFail = false;

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });

  it('여러 invalidation key 중 하나라도 갱신되면 refetch한다', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    let latestFocusEffect: (() => void | (() => void)) | undefined;

    mockUseFocusEffect.mockImplementation((focusEffect: () => void) => {
      latestFocusEffect = focusEffect;
    });

    const TestComponent = () => {
      useRefetchOnFocus({
        invalidationKey: [
          'profile.boardBookmarks',
          'profile.noticeBookmarks',
        ],
        refetch,
      });

      return null;
    };

    render(<TestComponent />);

    await flushFocus(latestFocusEffect);

    act(() => {
      invalidateData('profile.noticeBookmarks');
    });

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(1);

    act(() => {
      invalidateData('profile.boardBookmarks');
    });

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(2);
  });

  it('always-after-initial-focus 모드는 두 번째 focus부터 항상 refetch한다', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    let latestFocusEffect: (() => void | (() => void)) | undefined;

    mockUseFocusEffect.mockImplementation((focusEffect: () => void) => {
      latestFocusEffect = focusEffect;
    });

    const TestComponent = () => {
      useRefetchOnFocus({
        invalidationKey: 'taxi.home',
        mode: 'always-after-initial-focus',
        refetch,
      });

      return null;
    };

    render(<TestComponent />);

    await flushFocus(latestFocusEffect);
    expect(refetch).not.toHaveBeenCalled();

    await flushFocus(latestFocusEffect);
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
