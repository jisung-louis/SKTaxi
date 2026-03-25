import type { CampusStackParamList } from '@/app/navigation/types';
import { navigateToNoticeDetail } from '@/features/notice';
import type { Party } from '@/features/taxi';

type NavigationLike = {
  navigate: (...args: any[]) => void;
};

const tryNavigate = (navigate: () => void) => {
  try {
    navigate();
    return true;
  } catch {
    return false;
  }
};

export const navigateToCampusScreen = <
  TScreen extends keyof CampusStackParamList,
>(
  navigation: NavigationLike,
  screen: TScreen,
  params?: CampusStackParamList[TScreen],
) => {
  if (
    tryNavigate(() =>
      navigation.navigate('CampusTab', {
        screen,
        params,
      }),
    )
  ) {
    return;
  }

  if (params === undefined) {
    tryNavigate(() => navigation.navigate(screen as string));
    return;
  }

  tryNavigate(() => navigation.navigate(screen as string, params));
};

export const navigateToTaxiMain = (navigation: NavigationLike) => {
  if (
    tryNavigate(() =>
      navigation.navigate('Main', {
        screen: 'TaxiTab',
      }),
    )
  ) {
    return;
  }

  tryNavigate(() =>
    navigation.navigate('TaxiTab', {
      screen: 'TaxiMain',
    }),
  );
};

export const navigateToTaxiAcceptancePending = (
  navigation: NavigationLike,
  {
    party,
    requestId,
  }: {
    party: Party;
    requestId: string;
  },
) => {
  if (
    tryNavigate(() =>
      navigation.navigate('Main', {
        screen: 'TaxiTab',
        params: {
          screen: 'AcceptancePending',
          params: { party, requestId },
        },
      }),
    )
  ) {
    return;
  }

  tryNavigate(() =>
    navigation.navigate('TaxiTab', {
      screen: 'AcceptancePending',
      params: { party, requestId },
    }),
  );
};

export const navigateToNoticeMain = (
  navigation: NavigationLike,
) => {
  if (
    tryNavigate(() =>
      navigation.navigate('Main', {
        screen: 'NoticeTab',
      }),
    )
  ) {
    return;
  }

  tryNavigate(() =>
    navigation.navigate('NoticeTab', {
      screen: 'NoticeMain',
    }),
  );
};

export const createCampusEntryNavigation = (
  navigation: NavigationLike,
) => {
  return {
    openCampusScreen: <TScreen extends keyof CampusStackParamList>(
      screen: TScreen,
      params?: CampusStackParamList[TScreen],
    ) => navigateToCampusScreen(navigation, screen, params),
    openNoticeDetail: (noticeId: string) =>
      navigateToNoticeDetail(navigation, noticeId),
    openNoticeList: () => navigateToNoticeMain(navigation),
    openPendingJoinRequest: ({
      party,
      requestId,
    }: {
      party: Party;
      requestId: string;
    }) => navigateToTaxiAcceptancePending(navigation, { party, requestId }),
    openTaxiMain: () => navigateToTaxiMain(navigation),
  };
};
